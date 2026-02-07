import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing center ID" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Delete evaluations associated with the center
    // (Note: cascade delete would be better in DB, but let's be explicit)
    const { error: evalError } = await supabase
      .from("evaluations")
      .delete()
      .eq("center_id", id);

    if (evalError) {
      return NextResponse.json({ error: evalError.message }, { status: 500 });
    }

    // 2. Delete the center
    const { error: centerError } = await supabase
      .from("centers")
      .delete()
      .eq("id", id);

    if (centerError) {
      return NextResponse.json({ error: centerError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
