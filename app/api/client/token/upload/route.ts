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

    const formData = await req.formData();

    const submission_id = formData.get("submission_id") as string;
    const criterion_id = formData.get("criterion_id") as string;
    const file = formData.get("file") as File;

    if (!submission_id || !criterion_id || !file) {
      return NextResponse.json(
        { error: "Missing submission_id, criterion_id or file" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate that the evaluation exists and is pending
    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .select("id, status")
      .eq("id", submission_id)
      .single();

    if (evalError || !evaluation) {
      return NextResponse.json(
        { error: "Invalid evaluation ID" },
        { status: 404 }
      );
    }

    if (evaluation.status === "completed") {
      return NextResponse.json(
        { error: "Evaluation already completed" },
        { status: 403 }
      );
    }

    // Upload file to Supabase Storage
    const safeFilename = file.name.replace(/[^\w.\-]/g, "_");
    const filePath = `evaluations/${submission_id}/${criterion_id}/${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("evaluation-attachments")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("evaluation-attachments")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      file_name: file.name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
