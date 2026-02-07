import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function validateToken(token: string) {
  if (!token) return { error: "Missing token", status: 400 };

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Search in 'evaluations' table which is where the tokens are actually stored
  const { data: evaluation, error } = await supabase
    .from("evaluations")
    .select("id, center_id, status, token")
    .eq("token", token)
    .single();

  if (error || !evaluation) {
    return { error: "Invalid or expired token", status: 404 };
  }

  return {
    success: true,
    submission_id: evaluation.id,
    submission: {
      id: evaluation.id,
      center_id: evaluation.center_id,
      status: evaluation.status
    },
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
