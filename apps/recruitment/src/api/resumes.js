import { supabase } from '../lib/supabase.js';
import { ApiError, callFn, signedUrl } from './client.js';

const MAX_MB = 5;
const ALLOWED = ['pdf', 'doc', 'docx'];

/** Upload the resume to the caller's private folder. Returns { path, meta }. */
export async function uploadResume(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw new ApiError('Please upload a PDF, DOC or DOCX file.', 'BAD_FILE_TYPE');
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new ApiError(`File must be under ${MAX_MB} MB.`, 'FILE_TOO_LARGE');
  }
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) throw new ApiError('Please sign in first.', 'UNAUTHENTICATED');

  const path = `${me.user.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
  const { error } = await supabase.storage.from('resumes').upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw new ApiError(error.message, 'UPLOAD_FAILED');

  return {
    path: `resumes/${path}`,
    meta: { name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() },
  };
}

/** Server-side text extraction + heuristic parse. */
export function parseResume(path) {
  return callFn('parse-resume', { body: { path } });
}

export function resumeUrl(path) {
  return signedUrl('resumes', path.replace(/^resumes\//, ''));
}
