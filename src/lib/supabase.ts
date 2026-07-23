import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

/** Returns true if Supabase is configured (env vars are set). */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

let _supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

/**
 * Supabase client — returns `null` when env vars are not set.
 * Always check `isSupabaseConfigured()` or null before using.
 */
export function getSupabase(): SupabaseClient | null {
  return getClient();
}

/**
 * Legacy-style export for convenience (use getSupabase() in new code).
 * ⚠️ May be null — always guard with isSupabaseConfigured().
 */
export const supabase = getClient();
