import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | undefined

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) return serverClient

  // Use your actual Supabase env variables
  const url = process.env.SUPABASE_SUPABASE_URL || process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error("Missing Supabase URL. Check SUPABASE_SUPABASE_URL environment variable.")
  }
  if (!serviceRoleKey) {
    throw new Error("Missing Supabase service role key. Check SUPABASE_SUPABASE_SERVICE_ROLE_KEY environment variable.")
  }

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return serverClient
}
