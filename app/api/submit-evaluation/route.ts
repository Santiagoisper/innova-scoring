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
      notes,
      generalNotes,
      attachments,
    } = body

    /* =========================
       Validations
    ========================= */
    if (!token) {
      return NextResponse.json(
        { error: "Missing evaluation token" },
        { status: 400 }
      )
    }

    if (!responses || typeof responses !== 'object' || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid responses" },
        { status: 400 }
      )
    }

    // Basic email validation if provided
    if (evaluator_email && !/^\S+@\S+\.\S+$/.test(evaluator_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: "Invalid or expired evaluation link" },
        { status: 404 }
      )
    }

    if (evaluation.status !== "pending") {
      return NextResponse.json(
        { error: "Evaluation already submitted" },
        { status: 400 }
      )
    }

    /* =========================
       2) Fetch Criteria for Scoring
    ========================= */
    const { data: criteria, error: criteriaError } = await supabase
      .from("criteria")
      .select("*")
    
    if (criteriaError || !criteria) {
      return NextResponse.json(
        { error: "Failed to fetch evaluation criteria" },
        { status: 500 }
      )
    }

    /* =========================
       3) Calculate Score using Centralized Logic
    ========================= */
    const scoringInput = Object.entries(responses).map(([id, score]) => {
      const numScore = Number(score)
      if (isNaN(numScore) || numScore < 0 || numScore > 100) {
        throw new Error(`Invalid score for criterion ${id}: must be between 0 and 100`)
      }
      return {
        criterion_id: id,
        score: numScore
      }
    })

    const { totalScore, status: scoreLevel } = calculateWeightedScore(
      scoringInput,
      criteria as Criterion[]
    )

    /* =========================
       4) Update Evaluation
    ========================= */
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
          notes: notes || {},
          generalNotes: generalNotes || "",
        },
        notes: generalNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", evaluation.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    /* =========================
       5) Save Evaluation Items
    ========================= */
    // Delete existing items for this evaluation to be safe (idempotency)
    await supabase
      .from("evaluation_items")
      .delete()
      .eq("evaluation_id", evaluation.id)

    const items = Object.entries(responses).map(([criteria_id, score]) => ({
      evaluation_id: evaluation.id,
      criteria_id: criteria_id, // Keep as string if that's what the DB expects or cast if needed
      score: Number(score),
    }))

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("evaluation_items")
        .insert(items)
      
      if (itemsError) {
        console.error("Error inserting evaluation items:", itemsError)
        // We don't fail the whole request here as the main evaluation is updated
      }
    }

    /* =========================
       Success Response
    ========================= */
    return NextResponse.json({
      success: true,
      evaluation_id: evaluation.id,
      token,
      score: totalScore,
      level: scoreLevel,
      status: "completed",
    })
  } catch (err: any) {
    console.error("Submit evaluation error:", err)

    const status = err.message?.includes("Invalid score") ? 400 : 500
    const message = status === 400 ? err.message : "Internal server error"

    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
