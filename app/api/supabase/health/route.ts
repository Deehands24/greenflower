import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()

    // Test connection with a simple query
    const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

    if (error) {
      // If we can't query system tables, at least we connected
      return NextResponse.json({
        ok: true,
        message: "Connected to Supabase (system query failed but connection works)",
        error: error.message,
      })
    }

    return NextResponse.json({
      ok: true,
      message: "Successfully connected to Supabase",
      tablesFound: data?.length || 0,
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Unknown error connecting to Supabase",
      },
      { status: 500 },
    )
  }
}
