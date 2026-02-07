import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email y Token son requeridos" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Buscar el token en la tabla evaluations
    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .select("id, token, status, center_id, evaluator_email")
      .eq("token", token)
      .eq("status", "pending")
      .single()

    if (evalError || !evaluation) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    // Validar el email si está configurado en la evaluación
    if (evaluation.evaluator_email && evaluation.evaluator_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "El correo no coincide con el token proporcionado" },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      evaluation_id: evaluation.id,
      center_id: evaluation.center_id 
    })
  } catch (err) {
    console.error("Validation error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
