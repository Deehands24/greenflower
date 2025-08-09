import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    // A simple query to check database connectivity
    const { data, error } = await supabaseServer.from("app_state").select("id").limit(1)

    if (error) {
      console.error("Supabase health check failed:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Supabase health check failed:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
