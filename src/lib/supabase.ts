import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _initAttempted = false;

function getUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
}

function getKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
}

/** Returns true if Supabase is configured (env vars are set). */
export function isSupabaseConfigured(): boolean {
  const url = getUrl();
  const key = getKey();
  return Boolean(url && key && url.startsWith('http'));
}

function getClient(): SupabaseClient | null {
  if (_initAttempted) return _supabase;
  _initAttempted = true;
  
  const url = getUrl();
  const key = getKey();
  
  if (!url || !key || !url.startsWith('http')) return null;
  
  try {
    _supabase = createClient(url, key);
    return _supabase;
  } catch {
    return null;
  }
}

/**
 * Supabase client — returns `null` when env vars are not set.
 * Always check `isSupabaseConfigured()` or null before using.
 */
export function getSupabase(): SupabaseClient | null {
  return getClient();
}
