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

    const token = formData.get("token") as string;
    const criterion_id = formData.get("criterion_id") as string;
    const file = formData.get("file") as File;

    if (!token || !criterion_id || !file) {
      return NextResponse.json(
        { error: "Missing token, criterion_id or file" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: submission, error: submissionError } = await supabase
      .from("client_submissions")
      .select("id, submission_status")
      .eq("public_token", token)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    if (submission.submission_status === "completed") {
      return NextResponse.json(
        { error: "Submission already completed" },
        { status: 403 }
      );
    }

    const safeFilename = file.name.replace(/[^\w.\-]/g, "_");
    const filePath = `submissions/${submission.id}/${criterion_id}/${safeFilename}`;

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

    const { data: attachment, error: insertError } = await supabase
      .from("client_submission_attachments")
      .insert({
        submission_id: submission.id,
        criterion_id: Number(criterion_id),
        file_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attachment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
