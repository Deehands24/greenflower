"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | undefined

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  // Use your actual NEXT_PUBLIC Supabase env variables
  const url = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC Supabase env vars. Check SUPABASE_NEXT_PUBLIC_SUPABASE_URL and SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return browserClient
}
