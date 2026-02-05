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

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Buscar submission
    const { data: submission, error: findError } = await supabase
      .from("client_submissions")
      .select("id, submission_status, disclaimer_accepted")
      .eq("public_token", token)
      .single();

    if (findError || !submission) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Si ya fue aceptado, no hacemos nada
    if (submission.disclaimer_accepted) {
      return NextResponse.json({
        success: true,
        message: "Disclaimer already accepted",
      });
    }

    // Update disclaimer
    const { error: updateError } = await supabase
      .from("client_submissions")
      .update({
        disclaimer_accepted: true,
        disclaimer_accepted_at: new Date().toISOString(),
        submission_status:
          submission.submission_status === "pending"
            ? "sent"
            : submission.submission_status,
      })
      .eq("id", submission.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Disclaimer accepted",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

