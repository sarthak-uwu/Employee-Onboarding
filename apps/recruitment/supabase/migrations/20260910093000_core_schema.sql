-- ============================================================================
-- Ccentrik — core schema (Phase 1 foundation + document-requirement engine)
--
-- Covers: profiles/roles, candidates, jobs, TA application links, applications
-- with versioned timeline, the flexible document-requirement engine (all stages),
-- structured employment history, notifications, emails, audit log.
--
-- Interviews / offers / onboarding tables land in later phase migrations.
-- RLS policies are in the next migration (20260910093500_rls.sql).
-- ============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid, gen_random_bytes

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Application roles. A person has exactly one role on their profile.
create type app_role as enum (
  'candidate', 'ta', 'hr', 'admin', 'interviewer', 'employee'
);

create type job_status as enum ('draft', 'published', 'closed', 'archived');

create type application_source as enum ('careers', 'ta_link');

-- Application state machine. Values match the frontend APP_STATUS constants so
-- the existing status registry (src/constants/statuses.js) keeps working.
-- Master-prompt canonical name is noted where it differs.
create type application_status as enum (
  'DRAFT',                     -- started, not submitted
  'SUBMITTED',                 -- submitted / under_review entry point
  'TA_REVIEW',                 -- under_review
  'RETURNED',                  -- revision_requested
  'REJECTED',                  -- rejected / application closed
  'INTERVIEW_PLANNING',        -- approved, interview stage
  'INTERVIEW_IN_PROGRESS',
  'INTERVIEW_PASSED',          -- selected / advanced
  'INTERVIEW_FAILED',
  'DOCS_REQUESTED',            -- TA clicked "Proceed to Documents"
  'DOC_VERIFICATION',          -- candidate submitted pre-offer docs -> HR queue
  'DOCS_VERIFIED',             -- HR cleared all required docs -> offer unlocked
  'OFFER_DRAFT',
  'OFFER_ISSUED',              -- offer_sent
  'OFFER_VIEWED',
  'OFFER_ACCEPTED',
  'OFFER_DECLINED',
  'OFFER_EXPIRED',
  'ONBOARDING_PENDING',        -- TA "Ready for Onboarding" -> HR onboarding form
  'HR_VERIFICATION',
  'HR_VERIFICATION_REJECTED',
  'JOINING_PENDING',
  'EMPLOYEE'
);

-- Where in the journey a document requirement applies.
create type document_stage as enum (
  'application', 'pre_offer', 'offer', 'onboarding', 'employee'
);

-- How strictly a requirement is enforced.
create type requirement_class as enum ('mandatory', 'required', 'conditional');

-- Per-application document state. Matches the pre-offer verification spec.
create type document_status as enum (
  'requested',
  'uploaded',
  'under_verification',
  'verified',
  'rejected',
  'revision_required',
  'cannot_provide'
);

create type notification_status as enum ('unread', 'read');

create type email_status as enum ('queued', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth.users, created by trigger on signup
-- ---------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        app_role not null default 'candidate',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on profiles (role);
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Staff allowlist. When a @ccentrik.com person signs in with Google and their
-- email is here, the signup trigger gives them this role instead of 'candidate'.
create table staff_invites (
  email       text primary key,
  role        app_role not null,
  invited_by  uuid references profiles (id),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically when a new auth user appears.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_role app_role;
begin
  select role into invited_role
  from staff_invites
  where lower(email) = lower(new.email);

  insert into profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(invited_role, 'candidate')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Convenience: the caller's role, used throughout RLS.
create or replace function current_role_name()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql
stable
as $$
  select current_role_name() in ('ta', 'hr', 'admin');
$$;

-- ---------------------------------------------------------------------------
-- candidates — the persistent candidate account (1:1 with a profile)
-- ---------------------------------------------------------------------------
create table candidates (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null unique references profiles (id) on delete cascade,
  first_name        text,
  last_name         text,
  email             text not null,
  phone             text,
  current_location  text,
  linkedin_url      text,
  portfolio_url     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger candidates_set_updated_at
  before update on candidates
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table jobs (
  id                uuid primary key default gen_random_uuid(),
  job_code          text not null unique,
  title             text not null,
  department        text,
  location          text,
  work_mode         text,
  employment_type   text,
  experience        text,
  description       text,
  responsibilities  jsonb not null default '[]',
  required_skills   text[] not null default '{}',
  qualifications    jsonb not null default '[]',
  preferred_skills  text[] not null default '{}',
  benefits          jsonb not null default '[]',
  deadline          date,
  status            job_status not null default 'draft',
  created_by        uuid references profiles (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index jobs_status_idx on jobs (status);
create trigger jobs_set_updated_at
  before update on jobs
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- application_links — one secure token per (TA, job)
-- ---------------------------------------------------------------------------
create table application_links (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique default encode(gen_random_bytes(24), 'hex'),
  job_id      uuid not null references jobs (id) on delete cascade,
  ta_id       uuid not null references profiles (id) on delete cascade,
  label       text,
  active      boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (job_id, ta_id)
);
create index application_links_token_idx on application_links (token);

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create sequence application_code_seq start 1001;

create table applications (
  id                  uuid primary key default gen_random_uuid(),
  application_code    text not null unique default ('APP-' || nextval('application_code_seq')),
  candidate_id        uuid not null references candidates (id) on delete cascade,
  job_id              uuid references jobs (id) on delete set null,
  application_link_id uuid references application_links (id) on delete set null,
  assigned_ta_id      uuid references profiles (id) on delete set null,
  source              application_source not null default 'careers',
  status              application_status not null default 'DRAFT',
  current_version     integer not null default 1,
  personal            jsonb not null default '{}',
  professional        jsonb not null default '{}',
  education           jsonb not null default '[]',
  additional          jsonb not null default '{}',
  autofilled          text[] not null default '{}',
  resume_path         text,
  resume_meta         jsonb,
  return_reason       text,
  reject_reason       text,
  submitted_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- one active application per candidate per job (drafts excluded)
  unique (candidate_id, job_id)
);
create index applications_candidate_idx on applications (candidate_id);
create index applications_ta_idx on applications (assigned_ta_id);
create index applications_status_idx on applications (status);
create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

-- Immutable snapshot of the application payload for each submitted version.
create table application_versions (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references applications (id) on delete cascade,
  version         integer not null,
  payload         jsonb not null,
  created_at      timestamptz not null default now(),
  unique (application_id, version)
);

-- Timeline / events. One row per meaningful transition.
create table application_events (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid not null references applications (id) on delete cascade,
  version           integer not null default 1,
  type              text not null,
  title             text not null,
  description       text,
  actor_profile_id  uuid references profiles (id),
  actor_label       text,
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now()
);
create index application_events_app_idx on application_events (application_id, created_at);

-- ---------------------------------------------------------------------------
-- Document-requirement engine
-- ---------------------------------------------------------------------------
create table document_requirements (
  id                       uuid primary key default gen_random_uuid(),
  stage                    document_stage not null,
  key                      text not null,
  name                     text not null,
  description              text,
  requirement_class        requirement_class not null default 'required',
  condition_type           text,               -- free text, e.g. 'if_applicable'
  quantity_required        integer not null default 1,
  requires_front_back      boolean not null default false,
  requires_employer        boolean not null default false,
  employer_count           integer not null default 0,
  requires_period          boolean not null default false,
  period_count             integer not null default 0,
  multiple_files           boolean not null default false,
  structured_data          boolean not null default false,
  requires_hr_verification boolean not null default true,
  can_mark_cannot_provide  boolean not null default true,
  reason_required          boolean not null default true,
  warning_message          text,
  allowed_file_types       text[] not null default '{pdf,jpg,jpeg,png}',
  max_file_size_mb         integer not null default 10,
  display_order            integer not null default 0,
  active                   boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (stage, key)
);
create trigger document_requirements_set_updated_at
  before update on document_requirements
  for each row execute function set_updated_at();

-- Per-application instance of a requirement. Multi-part requirements (front/back,
-- per-employer, per-period, multi-file) get several rows distinguished by the
-- slot columns; `slot_key` is a stable identifier the UI builds from them.
create table application_documents (
  id                     uuid primary key default gen_random_uuid(),
  application_id          uuid not null references applications (id) on delete cascade,
  requirement_id          uuid not null references document_requirements (id),
  slot_key               text not null default 'default',
  employer_label         text,
  employer_index         integer,
  period_label           text,
  side                   text,                 -- 'front' | 'back' | null
  status                 document_status not null default 'requested',
  cannot_provide_reason  text,
  hr_remarks             text,
  verified_by            uuid references profiles (id),
  verified_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (application_id, requirement_id, slot_key)
);
create index application_documents_app_idx on application_documents (application_id);
create trigger application_documents_set_updated_at
  before update on application_documents
  for each row execute function set_updated_at();

-- Versioned file uploads for a document slot. Corrections add a new row;
-- previous rows stay for the audit trail.
create table document_files (
  id                      uuid primary key default gen_random_uuid(),
  application_document_id uuid not null references application_documents (id) on delete cascade,
  storage_path            text not null,
  file_name               text not null,
  mime_type               text,
  size_bytes              bigint,
  version                 integer not null default 1,
  is_current              boolean not null default true,
  uploaded_by             uuid references profiles (id),
  uploaded_at             timestamptz not null default now()
);
create index document_files_doc_idx on document_files (application_document_id);

-- Structured "last three employments" (pre-offer checklist item 15).
create table employment_history (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid not null references applications (id) on delete cascade,
  record_index      integer not null,
  company_name      text,
  designation       text,
  joining_date      date,
  leaving_date      date,
  last_drawn_salary numeric,
  details           jsonb not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (application_id, record_index)
);
create trigger employment_history_set_updated_at
  before update on employment_history
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table notifications (
  id                    uuid primary key default gen_random_uuid(),
  recipient_profile_id  uuid references profiles (id) on delete cascade,
  recipient_role        app_role,
  title                 text not null,
  message               text,
  type                  text,
  entity_type           text,
  entity_id             uuid,
  status                notification_status not null default 'unread',
  read_at               timestamptz,
  metadata              jsonb not null default '{}',
  created_at            timestamptz not null default now(),
  check (recipient_profile_id is not null or recipient_role is not null)
);
create index notifications_recipient_idx on notifications (recipient_profile_id, status);
create index notifications_role_idx on notifications (recipient_role, status);

-- ---------------------------------------------------------------------------
-- emails + attachments (audit of every outbound message)
-- ---------------------------------------------------------------------------
create table emails (
  id            uuid primary key default gen_random_uuid(),
  recipient     text not null,
  sender        text,
  subject       text not null,
  body_html     text,
  body_text     text,
  template      text,
  entity_type   text,
  entity_id     uuid,
  status        email_status not null default 'queued',
  error         text,
  sent_at       timestamptz,
  failed_at     timestamptz,
  created_at    timestamptz not null default now()
);
create index emails_entity_idx on emails (entity_type, entity_id);

create table email_attachments (
  id            uuid primary key default gen_random_uuid(),
  email_id      uuid not null references emails (id) on delete cascade,
  storage_path  text not null,
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint
);

-- ---------------------------------------------------------------------------
-- audit_logs — immutable trail
-- ---------------------------------------------------------------------------
create table audit_logs (
  id                uuid primary key default gen_random_uuid(),
  actor_profile_id  uuid references profiles (id),
  actor_label       text,
  action            text not null,
  entity_type       text not null,
  entity_id         uuid,
  previous_state    jsonb,
  new_state         jsonb,
  remarks           text,
  created_at        timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at);

-- Block updates/deletes at the DB level — audit rows are append-only.
create or replace function forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;
create trigger audit_logs_no_update
  before update or delete on audit_logs
  for each row execute function forbid_mutation();
