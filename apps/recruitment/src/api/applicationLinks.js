import { supabase } from '../lib/supabase.js';
import { unwrap, callFn } from './client.js';

/** Public: resolve a TA link token into the job + recruiter it points to. */
export function resolveLink(token) {
  return callFn('resolve-link', { method: 'GET', query: { token } });
}

/** TA: one link per (me, job). Returns the existing one if it already exists. */
export async function createLink(jobId, label) {
  const { data: me } = await supabase.auth.getUser();
  const taId = me.user.id;
  const existing = await supabase
    .from('application_links')
    .select('*')
    .eq('job_id', jobId)
    .eq('ta_id', taId)
    .maybeSingle()
    .then(unwrap);
  if (existing) return existing;
  return supabase
    .from('application_links')
    .insert({ job_id: jobId, ta_id: taId, label: label ?? null })
    .select('*')
    .single()
    .then(unwrap);
}

export function listMyLinks() {
  return supabase
    .from('application_links')
    .select('*, jobs(title, job_code)')
    .order('created_at', { ascending: false })
    .then(unwrap);
}

export function setLinkActive(id, active) {
  return supabase.from('application_links').update({ active }).eq('id', id).select('*').single().then(unwrap);
}
