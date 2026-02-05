export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const token = body?.token;
    const criterion_id = body?.criterion_id;
    const answer = body?.answer;

    if (!token || !criterion_id || !answer) {
      return NextResponse.json(
        { error: "Missing token, criterion_id or answer" },
        { status: 400 }
      );
    }

    if (!["yes", "no"].includes(answer)) {
      return NextResponse.json(
        { error: "Answer must be 'yes' or 'no'" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Buscar submission por token
    const { data: submission, error: submissionError } = await supabase
      .from("client_submissions")
      .select("id, submission_status, disclaimer_accepted")
      .eq("public_token", token)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    if (!submission.disclaimer_accepted) {
      return NextResponse.json(
        { error: "Disclaimer not accepted" },
        { status: 403 }
      );
    }

    if (submission.submission_status === "completed") {
      return NextResponse.json(
        { error: "Submission already completed" },
        { status: 403 }
      );
    }

    // Upsert respuesta en client_submission_items
    const { data: item, error: upsertError } = await supabase
      .from("client_submission_items")
      .upsert(
        {
          submission_id: submission.id,
          criterion_id: Number(criterion_id),
          answer: answer,
        },
        {
          onConflict: "submission_id,criterion_id",
        }
      )
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
