import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function validateToken(token: string) {
  if (!token) return { error: "Missing token", status: 400 };

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: submission, error } = await supabase
    .from("client_submissions")
    .select(
      "id, center_id, client_name, client_email, client_organization, submission_status, disclaimer_accepted, disclaimer_accepted_at"
    )
    .eq("public_token", token)
    .single();

  if (error || !submission) {
    return { error: "Invalid or expired token", status: 404 };
  }

  return {
    success: true,
    submission_id: submission.id,
    submission,
  };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const result = await validateToken(token || "");
  return NextResponse.json(result, { status: result.status || 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await validateToken(body.token);
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
