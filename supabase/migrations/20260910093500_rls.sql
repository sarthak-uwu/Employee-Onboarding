-- ============================================================================
-- Row-level security. Role-based data isolation per the master prompt §24.
--
-- Principle: candidates see only their own records; the assigned TA sees their
-- assigned applications; HR/admin see the pipeline. Anything that must be
-- computed server-side (link resolution, application submission, status
-- transitions, notifications, emails, audit) runs in an edge function with the
-- service-role key and bypasses these policies.
-- ============================================================================

-- Can the caller read this application?
create or replace function can_read_application(app uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from applications a
    join candidates c on c.id = a.candidate_id
    where a.id = app
      and (
        c.profile_id = auth.uid()                 -- the candidate
        or a.assigned_ta_id = auth.uid()          -- the assigned TA
        or current_role_name() in ('hr', 'admin') -- HR / admin see the pipeline
      )
  );
$$;

alter table profiles               enable row level security;
alter table staff_invites          enable row level security;
alter table candidates             enable row level security;
alter table jobs                   enable row level security;
alter table application_links      enable row level security;
alter table applications           enable row level security;
alter table application_versions   enable row level security;
alter table application_events     enable row level security;
alter table document_requirements  enable row level security;
alter table application_documents  enable row level security;
alter table document_files         enable row level security;
alter table employment_history     enable row level security;
alter table notifications          enable row level security;
alter table emails                 enable row level security;
alter table email_attachments      enable row level security;
alter table audit_logs             enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select_self_or_staff on profiles
  for select using (id = auth.uid() or is_staff());

create policy profiles_update_self on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

create policy profiles_admin_all on profiles
  for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');

-- ---------------------------------------------------------------------------
-- staff_invites — admin only
-- ---------------------------------------------------------------------------
create policy staff_invites_admin on staff_invites
  for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');

-- ---------------------------------------------------------------------------
-- candidates
-- ---------------------------------------------------------------------------
create policy candidates_select_self_or_staff on candidates
  for select using (profile_id = auth.uid() or is_staff());

create policy candidates_insert_self on candidates
  for insert with check (profile_id = auth.uid());

create policy candidates_update_self on candidates
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- jobs — published jobs are public; staff see everything; TA/admin manage
-- ---------------------------------------------------------------------------
create policy jobs_select_published on jobs
  for select using (status = 'published' or is_staff());

create policy jobs_manage_ta_admin on jobs
  for all using (current_role_name() in ('ta', 'admin'))
  with check (current_role_name() in ('ta', 'admin'));

-- ---------------------------------------------------------------------------
-- application_links — the TA who owns it, plus staff
-- ---------------------------------------------------------------------------
create policy application_links_select on application_links
  for select using (ta_id = auth.uid() or is_staff());

create policy application_links_insert_own on application_links
  for insert with check (ta_id = auth.uid() and current_role_name() in ('ta', 'admin'));

create policy application_links_update_own on application_links
  for update using (ta_id = auth.uid() or current_role_name() = 'admin');

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create policy applications_select on applications
  for select using (can_read_application(id));

-- Candidate may create their own draft application.
create policy applications_insert_own on applications
  for insert with check (
    exists (select 1 from candidates c where c.id = candidate_id and c.profile_id = auth.uid())
  );

-- Candidate may edit their application only while it is a draft or was returned
-- for revision. All richer transitions go through edge functions.
create policy applications_update_candidate on applications
  for update using (
    status in ('DRAFT', 'RETURNED')
    and exists (select 1 from candidates c where c.id = candidate_id and c.profile_id = auth.uid())
  )
  with check (
    status in ('DRAFT', 'RETURNED', 'SUBMITTED')
    and exists (select 1 from candidates c where c.id = candidate_id and c.profile_id = auth.uid())
  );

create policy applications_update_staff on applications
  for update using (assigned_ta_id = auth.uid() or current_role_name() in ('hr', 'admin'));

-- ---------------------------------------------------------------------------
-- application_versions / application_events — read-through the parent
-- ---------------------------------------------------------------------------
create policy application_versions_select on application_versions
  for select using (can_read_application(application_id));

create policy application_events_select on application_events
  for select using (can_read_application(application_id));

-- ---------------------------------------------------------------------------
-- document_requirements — any signed-in user reads active ones; admin manages
-- ---------------------------------------------------------------------------
create policy document_requirements_select on document_requirements
  for select using (active or is_staff());

create policy document_requirements_admin on document_requirements
  for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');

-- ---------------------------------------------------------------------------
-- application_documents
-- ---------------------------------------------------------------------------
create policy application_documents_select on application_documents
  for select using (can_read_application(application_id));

-- Candidate updates their own slots (upload / can't-provide) while the app is in
-- a document stage; HR/admin update for verification.
create policy application_documents_update_candidate on application_documents
  for update using (
    exists (
      select 1 from applications a join candidates c on c.id = a.candidate_id
      where a.id = application_id and c.profile_id = auth.uid()
        and a.status in ('DOCS_REQUESTED', 'DOC_VERIFICATION')
    )
  );

create policy application_documents_update_hr on application_documents
  for update using (current_role_name() in ('hr', 'admin'));

-- ---------------------------------------------------------------------------
-- document_files
-- ---------------------------------------------------------------------------
create policy document_files_select on document_files
  for select using (
    exists (
      select 1 from application_documents d
      where d.id = application_document_id and can_read_application(d.application_id)
    )
  );

create policy document_files_insert_candidate on document_files
  for insert with check (
    exists (
      select 1 from application_documents d
      join applications a on a.id = d.application_id
      join candidates c on c.id = a.candidate_id
      where d.id = application_document_id and c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- employment_history
-- ---------------------------------------------------------------------------
create policy employment_history_select on employment_history
  for select using (can_read_application(application_id));

create policy employment_history_write_candidate on employment_history
  for all using (
    exists (
      select 1 from applications a join candidates c on c.id = a.candidate_id
      where a.id = application_id and c.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from applications a join candidates c on c.id = a.candidate_id
      where a.id = application_id and c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- notifications — you see notifications addressed to you or to your role
-- ---------------------------------------------------------------------------
create policy notifications_select on notifications
  for select using (
    recipient_profile_id = auth.uid()
    or recipient_role = current_role_name()
  );

create policy notifications_update_own on notifications
  for update using (
    recipient_profile_id = auth.uid() or recipient_role = current_role_name()
  );

-- ---------------------------------------------------------------------------
-- emails / audit_logs — staff read only, writes are service-role only
-- ---------------------------------------------------------------------------
create policy emails_select_staff on emails
  for select using (is_staff());

create policy email_attachments_select_staff on email_attachments
  for select using (is_staff());

create policy audit_logs_select_staff on audit_logs
  for select using (is_staff());
