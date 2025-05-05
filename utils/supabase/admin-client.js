// admin-client.js
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let adminSupabase;

export function createAdminClient() {
  if (!adminSupabase) {
    adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.admin.auth.token',  // 👈 isolate admin
        },
      }
    );
  }
  return adminSupabase;
}
