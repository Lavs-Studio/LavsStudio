import { supabase } from './supabase';

function assertSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export async function uploadPublicImage(bucket, filePath, file) {
  assertSupabaseClient();
  return supabase.storage.from(bucket).upload(filePath, file, {
    upsert: false,
    cacheControl: '3600',
  });
}

export async function removePublicImage(bucket, filePath) {
  assertSupabaseClient();
  return supabase.storage.from(bucket).remove([filePath]);
}

export function getPublicImageUrl(bucket, filePath) {
  assertSupabaseClient();
  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}