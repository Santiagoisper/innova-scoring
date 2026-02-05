import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
    if (!token || !responses) {
      return NextResponse.json(
        { error: "Missing token or responses" },
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
       2) Calculate Score
    ========================= */
    const scoreValues = Object.values(responses) as number[]

    const finalScore =
      scoreValues.length > 0
        ? Math.round(
            scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
          )
        : 0

    const scoreLevel =
      finalScore >= 80 ? "green" : finalScore >= 60 ? "yellow" : "red"

    /* =========================
       3) Update Evaluation (NO INSERT)
    ========================= */
    const { error: updateError } = await supabase
      .from("evaluations")
      .update({
        evaluator_email: evaluator_email || evaluation.evaluator_email,
        total_score: finalScore,

        // Link expires here
        status: "completed",

        // Traffic light score
        score_level: scoreLevel,

        // Store everything in responses JSON
        responses: {
          scores: responses,
          attachments: attachments || {},
          notes: notes || {},
          generalNotes: generalNotes || "",
        },

        notes: generalNotes || null,
      })
      .eq("id", evaluation.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    /* =========================
       4) Save Evaluation Items
       (Delete first to avoid duplicates)
    ========================= */
    await supabase
      .from("evaluation_items")
      .delete()
      .eq("evaluation_id", evaluation.id)

    const items = Object.entries(responses).map(([criteria_id, score]) => ({
      evaluation_id: evaluation.id,
      criteria_id: parseInt(criteria_id),
      score: score as number,
    }))

    if (items.length > 0) {
      await supabase.from("evaluation_items").insert(items)
    }

    /* =========================
       Success Response
    ========================= */
    return NextResponse.json({
      success: true,
      evaluation_id: evaluation.id,
      token,
      score: finalScore,
      level: scoreLevel,
      status: "completed",
    })
  } catch (err) {
    console.error("Submit evaluation error:", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
