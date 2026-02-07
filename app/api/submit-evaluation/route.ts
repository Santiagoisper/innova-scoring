import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateWeightedScore } from "@/lib/scoring/calculator"
import { Criterion } from "@/types"

/* =========================
   Supabase Client
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================
   POST Submit Evaluation
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      token,
      evaluator_email,
      responses,
      attachments,
      disclaimer_accepted,
      submitted_at
    } = body

    /* =========================
       Validations
    ========================= */
    if (!token) {
      return NextResponse.json({ error: "Missing evaluation token" }, { status: 400 })
    }

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: "Missing or invalid responses" }, { status: 400 })
    }

    /* =========================
       1) Fetch evaluation by token
    ========================= */
    const { data: evaluation, error: fetchError } = await supabase
      .from("evaluations")
      .select("*")
      .eq("token", token)
      .single()

    if (fetchError || !evaluation) {
      return NextResponse.json({ error: "Invalid or expired evaluation link" }, { status: 404 })
    }

    /* =========================
       2) Fetch Criteria for Scoring
    ========================= */
    const { data: criteria, error: criteriaError } = await supabase
      .from("criteria")
      .select("*")
    
    if (criteriaError || !criteria) {
      return NextResponse.json({ error: "Failed to fetch evaluation criteria" }, { status: 500 })
    }

    /* =========================
       3) Calculate Score
    ========================= */
    const scoringInput = Object.entries(responses)
      .filter(([_, val]) => typeof val === 'number')
      .map(([id, score]) => ({
        criterion_id: id,
        score: Number(score)
      }))

    const { totalScore, status: scoreLevel } = calculateWeightedScore(
      scoringInput,
      criteria as Criterion[]
    )

    /* =========================
       4) Update Evaluation
    ========================= */
    // We store the exact same format that the Center Details page expects
    const { error: updateError } = await supabase
      .from("evaluations")
      .update({
        evaluator_email: evaluator_email || evaluation.evaluator_email,
        total_score: totalScore,
        status: "completed",
        score_level: scoreLevel,
        responses: {
          scores: responses,
          attachments: attachments || {},
          disclaimer_accepted: disclaimer_accepted || false,
          submitted_at: submitted_at || new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", evaluation.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    /* =========================
       5) Save Evaluation Items (Optional but good for legacy/db-level analytics)
    ========================= */
    await supabase.from("evaluation_items").delete().eq("evaluation_id", evaluation.id)

    const items = scoringInput.map((item) => ({
      evaluation_id: evaluation.id,
      criteria_id: item.criterion_id,
      score: item.score,
    }))

    if (items.length > 0) {
      await supabase.from("evaluation_items").insert(items)
    }

    return NextResponse.json({
      success: true,
      evaluation_id: evaluation.id,
      score: totalScore,
      level: scoreLevel,
      status: "completed",
    })
  } catch (err: any) {
    console.error("Submit evaluation error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
