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

    // Buscamos un centro que coincida con el token público
    // Nota: Dependiendo de tu esquema, el email podría estar en 'centers' o 'client_submissions'
    // Según lo analizado, 'centers' tiene 'contact_email' y 'public_token'
    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("id, contact_email, public_token")
      .eq("public_token", token)
      .single()

    if (centerError || !center) {
      // Si no está en centers, probamos en client_submissions que tiene 'client_email' y 'public_token'
      const { data: submission, error: subError } = await supabase
        .from("client_submissions")
        .select("id, client_email, public_token")
        .eq("public_token", token)
        .single()

      if (subError || !submission) {
        return NextResponse.json(
          { error: "Token inválido" },
          { status: 401 }
        )
      }

      // Validamos el email en la sumisión
      if (submission.client_email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "El correo no coincide con el token proporcionado" },
          { status: 401 }
        )
      }

      return NextResponse.json({ success: true, type: "submission" })
    }

    // Validamos el email en el centro
    if (center.contact_email && center.contact_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "El correo no coincide con el token proporcionado" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, type: "center" })
  } catch (err) {
    console.error("Validation error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
