// POST /functions/v1/send-email
//   { emailId }                     -> send an already-queued row
//   { to, subject, html, text }     -> compose + send + log in one call
//   { to, template, vars }          -> render a template, then send + log
//
// Auth: the service role (internal calls) or a staff member. Delivery goes
// through real SMTP (denomailer). Every attempt updates the emails row.

import { fail, ok, preflight } from "../_shared/http.ts";
import { currentProfile, serviceClient } from "../_shared/supabase.ts";
import { render } from "../_shared/emailTemplates.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

function smtp() {
  const host = Deno.env.get("SMTP_HOST");
  const port = Number(Deno.env.get("SMTP_PORT") ?? "587");
  const user = Deno.env.get("SMTP_USER");
  const password = Deno.env.get("SMTP_PASSWORD");
  if (!host || !user || !password) return null;
  return new SMTPClient({
    connection: { hostname: host, port, tls: port === 465, auth: { username: user, password } },
  });
}

const FROM = Deno.env.get("SMTP_FROM") ?? "Ccentrik <no-reply@ccentrik.com>";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail("METHOD", "POST only.", 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isInternal = req.headers.get("Authorization") === `Bearer ${serviceKey}`;
  if (!isInternal) {
    const profile = await currentProfile(req);
    if (!profile || !["ta", "hr", "admin"].includes(profile.role)) {
      return fail("FORBIDDEN", "Not allowed.", 403);
    }
  }

  const svc = serviceClient();
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Malformed body.", 400);
  }

  // Resolve the email row + content --------------------------------------
  let emailId: string | null = body.emailId ?? null;
  let recipient: string;
  let subject: string;
  let html: string;
  let text: string;

  if (emailId) {
    const { data: row } = await svc.from("emails").select("*").eq("id", emailId).maybeSingle();
    if (!row) return fail("NOT_FOUND", "Email row not found.", 404);
    recipient = row.recipient;
    subject = row.subject;
    html = row.body_html ?? "";
    text = row.body_text ?? "";
  } else {
    if (!body.to) return fail("INVALID_REQUEST", "Missing recipient.", 400);
    recipient = body.to;
    if (body.template) {
      const r = render(body.template, body.vars ?? {});
      subject = r.subject;
      html = r.html;
      text = r.text;
    } else {
      subject = body.subject ?? "Ccentrik notification";
      html = body.html ?? `<p>${body.text ?? ""}</p>`;
      text = body.text ?? "";
    }
    const { data: row } = await svc
      .from("emails")
      .insert({
        recipient,
        sender: FROM,
        subject,
        body_html: html,
        body_text: text,
        template: body.template ?? null,
        entity_type: body.entityType ?? null,
        entity_id: body.entityId ?? null,
        status: "queued",
      })
      .select("id")
      .single();
    emailId = row?.id ?? null;
  }

  // Send ----------------------------------------------------------------
  const client = smtp();
  if (!client) {
    if (emailId) {
      await svc.from("emails").update({ status: "failed", error: "SMTP not configured", failed_at: new Date().toISOString() }).eq("id", emailId);
    }
    return fail("SMTP_NOT_CONFIGURED", "Email service is not configured.", 503);
  }

  try {
    await client.send({ from: FROM, to: recipient, subject, content: text || " ", html });
    await client.close();
    if (emailId) {
      await svc.from("emails").update({ status: "sent", sent_at: new Date().toISOString(), error: null }).eq("id", emailId);
    }
    return ok({ emailId, status: "sent" });
  } catch (e) {
    if (emailId) {
      await svc.from("emails").update({ status: "failed", error: String(e), failed_at: new Date().toISOString() }).eq("id", emailId);
    }
    return fail("SEND_FAILED", "The email could not be delivered.", 502);
  }
});
