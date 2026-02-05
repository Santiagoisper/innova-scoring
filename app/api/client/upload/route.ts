import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // validar usuario
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // validar submission pertenece al user
    const { data: submission, error: submissionError } = await supabase
      .from("client_submissions")
      .select("id, user_id, submission_status")
      .eq("id", submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.user_id !== userData.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (submission.submission_status === "completed") {
      return NextResponse.json(
        { error: "Submission already completed" },
        { status: 403 }
      );
    }

    // validar criterion existe
    const { data: criterion, error: criterionError } = await supabase
      .from("criteria")
      .select("id")
      .eq("id", criterion_id)
      .single();

    if (criterionError || !criterion) {
      return NextResponse.json(
        { error: "Criterion not found" },
        { status: 404 }
      );
    }

    // path obligatorio
    const safeFilename = file.name.replace(/[^\w.\-]/g, "_");
    const filePath = `submissions/${submission_id}/${criterion_id}/${safeFilename}`;

    // subir a storage
    const { error: uploadError } = await supabase.storage
      .from("evaluación-adjuntos")
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

    // insertar en tabla attachments
    const { data: attachment, error: insertError } = await supabase
      .from("client_submission_attachments")
      .insert({
        submission_id,
        criterion_id,
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
