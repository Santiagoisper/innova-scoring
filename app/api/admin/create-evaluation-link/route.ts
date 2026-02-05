import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { center_id, evaluator_email } = body

    if (!center_id) {
      return NextResponse.json(
        { error: "Missing center_id" },
        { status: 400 }
      )
    }

    // ✅ 1. Check existing pending evaluation
    const { data: existing } = await supabase
      .from("evaluations")
      .select("token")
      .eq("center_id", center_id)
      .eq("status", "pending")
      .single()

    if (existing?.token) {
      return NextResponse.json({
        token: existing.token,
        link: `${process.env.NEXT_PUBLIC_BASE_URL}/cliente/${existing.token}`,
        reused: true,
      })
    }

    // ✅ 2. Create new evaluation token
    const token = randomUUID()

    const { error: insertError } = await supabase
      .from("evaluations")
      .insert([
        {
          token,
          center_id,
          evaluator_email: evaluator_email || null,
          status: "pending",
        },
      ])

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      token,
      link: `${process.env.NEXT_PUBLIC_BASE_URL}/cliente/${token}`,
      reused: false,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
