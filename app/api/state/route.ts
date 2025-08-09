import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("project") || process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "default"

  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from("app_state")
      .select("project_id, state, updated_at")
      .eq("project_id", projectId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      data: data?.state || null,
      lastUpdated: data?.updated_at || null,
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Failed to load state",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const projectId = body.project || process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "default"
    const state = body.state

    if (!state) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing 'state' in request body",
        },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from("app_state").upsert({
      project_id: projectId,
      state: state,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: "State saved successfully",
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Failed to save state",
      },
      { status: 500 },
    )
  }
}
