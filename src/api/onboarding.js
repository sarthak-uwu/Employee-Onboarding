import { supabase } from '../lib/supabase.js';
import { unwrap } from './client.js';

export function listOnboardingCases() {
  return supabase
    .from('onboarding_cases')
    .select('*')
    .order('created_at', { ascending: false })
    .then(unwrap);
}

export function getOnboardingCase(id) {
  return supabase.from('onboarding_cases').select('*').eq('id', id).single().then(unwrap);
}
