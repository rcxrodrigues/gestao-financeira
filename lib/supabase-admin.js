import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ATENÇÃO: use somente em rotas server-side (route handlers)
// Esta chave ignora RLS e tem permissão total
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
