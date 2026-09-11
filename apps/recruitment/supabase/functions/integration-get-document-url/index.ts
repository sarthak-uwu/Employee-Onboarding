// POST /functions/v1/integration-get-document-url
// Inbound from the HR app when a reviewer opens a document — mints a
// short-lived signed URL instead of ever handing HR raw storage access
// (docs/requirements/03-recruitment-hr-integration.md §25). Service-to-
// service only; not tied to any recruitment user session.
//
// Body: { sourceDocumentId }  (an application_documents.id)

import { fail, ok, preflight } from "../_shared/http.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { verifyServiceRequest } from "../_shared/serviceAuth.ts";

const EXPIRES_IN = 300; // seconds

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail("METHOD", "POST only.", 405);
  if (!verifyServiceRequest(req)) return fail("FORBIDDEN", "Invalid service credentials.", 403);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Malformed body.", 400);
  }
  if (!body.sourceDocumentId) return fail("VALIDATION_ERROR", "Missing sourceDocumentId.", 422);

  const svc = serviceClient();
  const { data: file } = await svc
    .from("document_files")
    .select("storage_path, file_name")
    .eq("application_document_id", body.sourceDocumentId)
    .eq("is_current", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!file) return fail("NOT_FOUND", "No file on record for this document.", 404);

  const objectPath = file.storage_path.replace(/^documents\//, "");
  const { data: signed, error } = await svc.storage.from("documents").createSignedUrl(objectPath, EXPIRES_IN);
  if (error || !signed) return fail("STORAGE_ERROR", "Could not create a document link.", 500);

  return ok({ url: signed.signedUrl, fileName: file.file_name, expiresIn: EXPIRES_IN });
});
