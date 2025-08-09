import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from("app_state").select("app_state_data").eq("id", "main").single()

    if (error) {
      if (error.code === "PGRST116") {
        // No data found, return empty state
        return NextResponse.json({ appState: null })
      }
      throw error
    }

    return NextResponse.json({ appState: data.app_state_data })
  } catch (error: any) {
    console.error("Failed to load state:", error)
    return NextResponse.json({ error: "Failed to load state: " + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appState } = await request.json() // Renamed from 'state' to 'appState'

    if (!appState) {
      return NextResponse.json({ success: false, error: "App state is required" }, { status: 400 })
    }

    const { error } = await supabaseServer.from("app_state").upsert({
      id: "main",
      app_state_data: appState, // Column name in DB
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to save state:", error)
    return NextResponse.json({ error: "Failed to save state: " + error.message }, { status: 500 })
  }
}
