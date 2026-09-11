-- ============================================================================
-- Recruitment <-> HR integration support.
--
-- This app never calls into the HR app's database — only its edge functions,
-- authenticated with a shared secret (apps/recruitment/supabase/functions/
-- _shared/serviceAuth.ts). This migration adds:
--   * integration_events — inbound log from HR (idempotency + audit)
--   * offer_eligibility() / offer_blocking_reasons() — the backend-enforced
--     "can TA send the offer yet" rule (docs/requirements/03-*.md §6, §10-11;
--     01-*.md §12/§20). Nothing calls this yet (the offer stage isn't built),
--     but it's ready for that phase and is directly testable now.
-- ============================================================================

create type integration_event_status as enum ('received', 'processing', 'success', 'failed');

create table integration_events (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null unique,
  event_type    text not null,
  source_system text not null default 'hr',
  payload       jsonb not null,
  status        integration_event_status not null default 'received',
  error         text,
  entity_type   text,
  entity_id     uuid,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);
create index integration_events_type_idx on integration_events (event_type, created_at);

alter table integration_events enable row level security;
create policy integration_events_select_staff on integration_events
  for select using (is_staff());

-- Outbound attempt log, so a failed call to HR (offer-accepted, document-
-- submitted) is never silently lost — see docs/requirements/03-*.md §23.
-- Nothing writes to this yet; it lands alongside the emit calls in the phase
-- that produces them (pre-offer upload, offer acceptance).
create table integration_outbox (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null unique,
  event_type    text not null,
  target_system text not null default 'hr',
  payload       jsonb not null,
  status        integration_event_status not null default 'received',
  attempt_count integer not null default 0,
  last_error    text,
  entity_type   text,
  entity_id     uuid,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz
);
alter table integration_outbox enable row level security;
create policy integration_outbox_select_staff on integration_outbox
  for select using (is_staff());

-- ---------------------------------------------------------------------------
-- Offer eligibility. Mandatory pre-offer documents must be `verified`;
-- `required` (non-mandatory) documents also accept `cannot_provide` (the
-- candidate gave a reason). Conditional documents are excluded from this v1 —
-- they need an explicit "does this apply to the candidate" flag that the
-- pre-offer upload UI (not yet built) will set.
-- ---------------------------------------------------------------------------
create or replace function offer_eligibility(app_id uuid)
returns text
language plpgsql
stable
as $$
declare
  doc_count integer;
  mandatory_unmet integer;
  required_unmet integer;
  any_rejected integer;
  any_not_uploaded integer;
begin
  select count(*) into doc_count
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class in ('mandatory', 'required');

  if doc_count = 0 then
    return 'DOCUMENTS_PENDING'; -- TA hasn't requested pre-offer documents yet
  end if;

  select count(*) into mandatory_unmet
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class = 'mandatory' and ad.status <> 'verified';

  select count(*) into required_unmet
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class = 'required' and ad.status not in ('verified', 'cannot_provide');

  if mandatory_unmet = 0 and required_unmet = 0 then
    return 'READY_FOR_OFFER';
  end if;

  select count(*) into any_rejected
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class in ('mandatory', 'required')
    and ad.status in ('rejected', 'revision_required');
  if any_rejected > 0 then
    return 'DOCUMENTS_REJECTED';
  end if;

  select count(*) into any_not_uploaded
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class in ('mandatory', 'required')
    and ad.status = 'requested';
  if any_not_uploaded > 0 then
    return 'DOCUMENTS_INCOMPLETE';
  end if;

  return 'HR_VERIFICATION_PENDING'; -- uploaded / under_verification, waiting on HR
end;
$$;

-- Human-readable blocking items for the TA "Offer Locked" panel
-- (docs/requirements/01-*.md §12).
create or replace function offer_blocking_reasons(app_id uuid)
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(
    r.name || case
      when ad.status = 'rejected' then ' — rejected'
      when ad.status = 'revision_required' then ' — correction required'
      when ad.status = 'requested' then ' — not yet uploaded'
      else ' — awaiting HR verification'
    end
  ), '{}')
  from application_documents ad
  join document_requirements r on r.id = ad.requirement_id
  where ad.application_id = app_id and r.stage = 'pre_offer' and r.active
    and r.requirement_class in ('mandatory', 'required')
    and not (ad.status = 'verified' or (r.requirement_class = 'required' and ad.status = 'cannot_provide'));
$$;
