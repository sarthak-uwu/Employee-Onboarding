// POST /functions/v1/submit-application
// Auth: candidate. Creates the application and everything that must happen with
// it — atomically enough that we never leave a half-built application: the row
// and its v1 snapshot go in first, then best-effort side effects.
//
// Body: {
//   jobId?, linkToken?, source?,
//   personal, professional, education, additional, autofilled,
//   resumePath, resumeMeta
// }

import { fail, ok, preflight } from "../_shared/http.ts";
import { audit, currentProfile, serviceClient } from "../_shared/supabase.ts";
import { addEvent, notify, queueEmail, siteUrl } from "../_shared/workflow.ts";
import { render } from "../_shared/emailTemplates.ts";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+]?[\d\s()-]{8,}$/;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail("METHOD", "POST only.", 405);

  const profile = await currentProfile(req);
  if (!profile) return fail("UNAUTHENTICATED", "Please sign in to apply.", 401);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Malformed request body.", 400);
  }

  const personal = body.personal ?? {};
  const fields: Record<string, string> = {};
  if (!personal.firstName?.trim()) fields.firstName = "First name is required.";
  if (!personal.lastName?.trim()) fields.lastName = "Last name is required.";
  if (!personal.email?.trim()) fields.email = "Email is required.";
  else if (!emailRe.test(personal.email)) fields.email = "Enter a valid email address.";
  if (!personal.mobile?.trim()) fields.mobile = "Phone number is required.";
  else if (!phoneRe.test(personal.mobile)) fields.mobile = "Enter a valid phone number.";
  if (!body.resumePath) fields.resume = "A resume is required.";
  if (Object.keys(fields).length) {
    return fail("VALIDATION_ERROR", "Please complete the required fields.", 422, fields);
  }

  const svc = serviceClient();

  // --- candidate record ---------------------------------------------------
  const { data: candidate, error: candErr } = await svc
    .from("candidates")
    .upsert(
      {
        profile_id: profile.id,
        first_name: personal.firstName,
        last_name: personal.lastName,
        email: personal.email,
        phone: personal.mobile,
        current_location: personal.currentLocation ?? null,
        linkedin_url: body.additional?.linkedin ?? null,
        portfolio_url: body.additional?.portfolio ?? null,
      },
      { onConflict: "profile_id" },
    )
    .select("id")
    .single();
  if (candErr || !candidate) {
    return fail("DB_ERROR", "Could not save your candidate profile.", 500);
  }

  // --- resolve job / link ------------------------------------------------
  let jobId: string | null = null;
  let assignedTaId: string | null = null;
  let applicationLinkId: string | null = null;
  let source: "careers" | "ta_link" = "careers";

  if (body.linkToken) {
    const { data: link } = await svc
      .from("application_links")
      .select("id, active, expires_at, job_id, ta_id")
      .eq("token", String(body.linkToken).trim())
      .maybeSingle();
    if (!link || !link.active) return fail("LINK_INVALID", "This application link is no longer active.", 410);
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return fail("LINK_EXPIRED", "This application link has expired.", 410);
    }
    jobId = link.job_id;
    assignedTaId = link.ta_id; // server-side attribution — candidate cannot set this
    applicationLinkId = link.id;
    source = "ta_link";
  } else if (body.jobId) {
    jobId = body.jobId;
  }

  if (jobId) {
    const { data: job } = await svc
      .from("jobs")
      .select("id, title, status")
      .eq("id", jobId)
      .maybeSingle();
    if (!job) return fail("JOB_NOT_FOUND", "That role could not be found.", 404);
    if (job.status !== "published") {
      return fail("JOB_CLOSED", "This role is no longer accepting applications.", 410);
    }
  }

  // --- duplicate guard --------------------------------------------------
  if (jobId) {
    const { data: existing } = await svc
      .from("applications")
      .select("id, status")
      .eq("candidate_id", candidate.id)
      .eq("job_id", jobId)
      .neq("status", "DRAFT")
      .maybeSingle();
    if (existing) {
      return fail("DUPLICATE_APPLICATION", "You have already applied for this role.", 409);
    }
  }

  // --- create the application -----------------------------------------
  const payload = {
    personal,
    professional: body.professional ?? {},
    education: body.education ?? [],
    additional: body.additional ?? {},
    autofilled: body.autofilled ?? [],
    resume_path: body.resumePath,
    resume_meta: body.resumeMeta ?? null,
  };

  const { data: application, error: appErr } = await svc
    .from("applications")
    .insert({
      candidate_id: candidate.id,
      job_id: jobId,
      application_link_id: applicationLinkId,
      assigned_ta_id: assignedTaId,
      source,
      status: "SUBMITTED",
      current_version: 1,
      submitted_at: new Date().toISOString(),
      ...payload,
    })
    .select("id, application_code, job_id")
    .single();
  if (appErr || !application) {
    return fail("DB_ERROR", "Could not submit your application. Please try again.", 500);
  }

  await svc.from("application_versions").insert({
    application_id: application.id,
    version: 1,
    payload,
  });

  // --- side effects (best effort) ------------------------------------
  const jobTitle = jobId
    ? (await svc.from("jobs").select("title").eq("id", jobId).maybeSingle()).data?.title ??
      "the role"
    : "General Application";
  const candidateName = `${personal.firstName} ${personal.lastName}`.trim();
  const appLink = siteUrl("/candidate/application");

  await addEvent(svc, {
    application_id: application.id,
    type: "application",
    title: "Application Submitted",
    description: `Candidate applied for ${jobTitle}.`,
    actor_profile_id: profile.id,
    actor_label: candidateName,
  });

  await notify(svc, {
    recipient_profile_id: assignedTaId,
    recipient_role: assignedTaId ? null : "ta",
    title: "New application received",
    message: `${candidateName} applied for ${jobTitle}.`,
    type: "application_submitted",
    entity_type: "application",
    entity_id: application.id,
  });

  await audit(svc, {
    actor_profile_id: profile.id,
    actor_label: candidateName,
    action: "application.submit",
    entity_type: "application",
    entity_id: application.id,
    new_state: { status: "SUBMITTED", source },
  });

  const mail = render("application_submitted", {
    candidate_name: candidateName,
    job_title: jobTitle,
    application_code: application.application_code,
    application_link: appLink,
  });
  await queueEmail(svc, {
    recipient: personal.email,
    subject: mail.subject,
    body_html: mail.html,
    body_text: mail.text,
    template: "application_submitted",
    entity_type: "application",
    entity_id: application.id,
  });

  return ok({
    applicationId: application.id,
    applicationCode: application.application_code,
    status: "SUBMITTED",
  });
});
