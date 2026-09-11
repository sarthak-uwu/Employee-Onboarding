-- ============================================================================
-- Private storage buckets + access policies.
--
-- Path conventions (first folder segment drives the policy):
--   resumes/{profile_id}/{file}
--   documents/{application_id}/{requirement_key}/{file}
--   offer-letters/{application_id}/{file}
--   email-attachments/{email_id}/{file}
--
-- All buckets are private. The frontend reads files through short-lived signed
-- URLs (createSignedUrl) which still run these policies.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('resumes', 'resumes', false),
  ('documents', 'documents', false),
  ('offer-letters', 'offer-letters', false),
  ('email-attachments', 'email-attachments', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- resumes — candidate owns their folder, staff can read
-- ---------------------------------------------------------------------------
create policy "resumes: candidate reads own" on storage.objects
  for select using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes: staff read" on storage.objects
  for select using (bucket_id = 'resumes' and is_staff());

create policy "resumes: candidate writes own" on storage.objects
  for insert with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes: candidate updates own" on storage.objects
  for update using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- documents — tied to an application the caller can access
-- ---------------------------------------------------------------------------
create policy "documents: read with application access" on storage.objects
  for select using (
    bucket_id = 'documents'
    and can_read_application(((storage.foldername(name))[1])::uuid)
  );

create policy "documents: candidate uploads to own application" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and exists (
      select 1 from applications a join candidates c on c.id = a.candidate_id
      where a.id = ((storage.foldername(name))[1])::uuid
        and c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- offer-letters — staff upload, candidate + staff read
-- ---------------------------------------------------------------------------
create policy "offer-letters: read with application access" on storage.objects
  for select using (
    bucket_id = 'offer-letters'
    and can_read_application(((storage.foldername(name))[1])::uuid)
  );

create policy "offer-letters: staff upload" on storage.objects
  for insert with check (bucket_id = 'offer-letters' and is_staff());

-- ---------------------------------------------------------------------------
-- email-attachments — staff read only; writes happen with the service role
-- ---------------------------------------------------------------------------
create policy "email-attachments: staff read" on storage.objects
  for select using (bucket_id = 'email-attachments' and is_staff());
