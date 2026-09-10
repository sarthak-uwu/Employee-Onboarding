import { supabase } from '../lib/supabase.js';
import { unwrap } from './client.js';

const COLUMNS =
  'id, job_code, title, department, location, work_mode, employment_type, experience, description, responsibilities, required_skills, qualifications, preferred_skills, benefits, deadline, status, created_at';

export function listPublishedJobs() {
  return supabase
    .from('jobs')
    .select(COLUMNS)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .then(unwrap);
}

export function getJob(id) {
  return supabase.from('jobs').select(COLUMNS).eq('id', id).single().then(unwrap);
}

export function getJobByCode(code) {
  return supabase.from('jobs').select(COLUMNS).eq('job_code', code).maybeSingle().then(unwrap);
}

/** TA/admin: every job regardless of status. */
export function listAllJobs() {
  return supabase
    .from('jobs')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .then(unwrap);
}

export function createJob(payload) {
  return supabase.from('jobs').insert(payload).select(COLUMNS).single().then(unwrap);
}

export function updateJob(id, patch) {
  return supabase.from('jobs').update(patch).eq('id', id).select(COLUMNS).single().then(unwrap);
}
