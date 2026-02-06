import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// ✅ GET: permite usar /api/client/token/validate?token=xxxx
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: submission, error } = await supabase
      .from("client_submissions")
      .select(
        "id, center_id, client_name, client_email, client_organization, submission_status, disclaimer_accepted, disclaimer_accepted_at"
      )
      .eq("public_token", token)
      .single();

    if (error || !submission) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      submission_id: submission.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// ✅ POST: sigue funcionando para requests por body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: submission, error } = await supabase
      .from("client_submissions")
      .select(
        "id, center_id, client_name, client_email, client_organization, submission_status, disclaimer_accepted, disclaimer_accepted_at"
      )
      .eq("public_token", token)
      .single();

    if (error || !submission) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      submission_id: submission.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
