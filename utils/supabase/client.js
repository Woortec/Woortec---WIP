// client.js

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseClient;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return supabaseClient;
}
