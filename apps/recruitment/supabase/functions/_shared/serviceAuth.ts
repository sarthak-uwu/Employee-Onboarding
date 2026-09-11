// Service-to-service auth for cross-application integration calls from the HR
// app. Mirrors apps/hr/supabase/functions/_shared/serviceAuth.ts — the same
// secret is set in both projects (INTEGRATION_SHARED_SECRET). See
// docs/requirements/03-recruitment-hr-integration.md §8/§24.

export function verifyServiceRequest(req: Request): boolean {
  const expected = Deno.env.get("INTEGRATION_SHARED_SECRET");
  if (!expected) return false;
  const got = req.headers.get("X-Integration-Secret");
  return got === expected;
}
