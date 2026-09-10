// POST /functions/v1/resubmit-application
// Auth: the candidate. Applies edits to a RETURNED application, snapshots a new
// version, and sends it back to TA review — prior versions are never destroyed.
//
// Body: { applicationId, personal?, professional?, education?, additional? }

import { fail, ok, preflight } from "../_shared/http.ts";
import { audit, currentProfile, serviceClient } from "../_shared/supabase.ts";
import { addEvent, notify } from "../_shared/workflow.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail("METHOD", "POST only.", 405);

  const profile = await currentProfile(req);
  if (!profile) return fail("UNAUTHENTICATED", "Please sign in.", 401);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Malformed body.", 400);
  }

  const svc = serviceClient();
  const { data: app } = await svc
    .from("applications")
    .select("id, status, current_version, assigned_ta_id, personal, professional, education, additional, " +
      "candidates(profile_id, first_name, last_name), jobs(title)")
    .eq("id", body.applicationId)
    .maybeSingle();

  if (!app) return fail("NOT_FOUND", "Application not found.", 404);
  if ((app.candidates as any)?.profile_id !== profile.id) {
    return fail("FORBIDDEN", "This is not your application.", 403);
  }
  if (app.status !== "RETURNED") {
    return fail("INVALID_STATE", "This application is not awaiting an update.", 409);
  }

  const nextVersion = (app.current_version ?? 1) + 1;
  const payload = {
    personal: body.personal ?? app.personal,
    professional: body.professional ?? app.professional,
    education: body.education ?? app.education,
    additional: body.additional ?? app.additional,
  };

  const { error: upErr } = await svc
    .from("applications")
    .update({
      ...payload,
      status: "TA_REVIEW",
      current_version: nextVersion,
      return_reason: null,
    })
    .eq("id", app.id);
  if (upErr) return fail("DB_ERROR", "Could not resubmit. Please try again.", 500);

  await svc.from("application_versions").insert({
    application_id: app.id,
    version: nextVersion,
    payload,
  });

  const candidateName = `${(app.candidates as any)?.first_name ?? ""} ${(app.candidates as any)?.last_name ?? ""}`.trim();

  await addEvent(svc, {
    application_id: app.id,
    version: nextVersion,
    type: "application",
    title: "Application Resubmitted",
    description: `Candidate resubmitted the application (version ${nextVersion}).`,
    actor_profile_id: profile.id,
    actor_label: candidateName || "Candidate",
  });

  await notify(svc, {
    recipient_profile_id: app.assigned_ta_id,
    recipient_role: app.assigned_ta_id ? null : "ta",
    title: "Application resubmitted",
    message: `${candidateName || "A candidate"} updated and resubmitted their application for ${(app.jobs as any)?.title ?? "a role"}.`,
    type: "application_resubmitted",
    entity_type: "application",
    entity_id: app.id,
  });

  await audit(svc, {
    actor_profile_id: profile.id,
    action: "application.resubmit",
    entity_type: "application",
    entity_id: app.id,
    previous_state: { status: "RETURNED", version: app.current_version },
    new_state: { status: "TA_REVIEW", version: nextVersion },
  });

  return ok({ status: "TA_REVIEW", version: nextVersion });
});
