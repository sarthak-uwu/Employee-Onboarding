import { supabase } from '../lib/supabase.js';
import { unwrap, callFn } from './client.js';

const LIST_COLUMNS =
  'id, application_code, status, source, current_version, submitted_at, created_at, ' +
  'job_id, assigned_ta_id, personal, professional, ' +
  'jobs(title, job_code, department), candidates(first_name, last_name, email, phone)';

/** Candidate: submit through the transactional edge function. */
export function submitApplication(payload) {
  return callFn('submit-application', { body: payload });
}

/** Candidate: my applications (RLS already limits this to me). */
export function listMyApplications() {
  return supabase
    .from('applications')
    .select(LIST_COLUMNS)
    .neq('status', 'DRAFT')
    .order('created_at', { ascending: false })
    .then(unwrap);
}

export function getApplication(id) {
  return supabase
    .from('applications')
    .select(
      `${LIST_COLUMNS}, education, additional, autofilled, resume_path, resume_meta, ` +
        'return_reason, reject_reason, application_link_id'
    )
    .eq('id', id)
    .single()
    .then(unwrap);
}

export function getApplicationEvents(id) {
  return supabase
    .from('application_events')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: true })
    .then(unwrap);
}

/** TA/HR: pipeline list. RLS limits TA to their assigned applications. */
export function listApplications({ status, search } = {}) {
  let q = supabase.from('applications').select(LIST_COLUMNS).neq('status', 'DRAFT');
  if (status) q = q.eq('status', status);
  if (search) q = q.or(`application_code.ilike.%${search}%`);
  return q.order('submitted_at', { ascending: false, nullsFirst: false }).then(unwrap);
}

/** Candidate: edit + resubmit an application that was returned for revision. */
export function updateReturnedApplication(id, patch) {
  return supabase
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select(LIST_COLUMNS)
    .single()
    .then(unwrap);
}
