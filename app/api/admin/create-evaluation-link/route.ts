import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Email sending function (using Resend or similar service)
async function sendEvaluationEmail(recipientEmail: string, centerName: string, token: string, link: string) {
  // TODO: Integrate with Resend API or your preferred email service
  // For now, we'll log it. In production, uncomment and configure:
  
  /*
  const resend = new Resend(process.env.RESEND_API_KEY!)
  
  await resend.emails.send({
    from: 'Innova Trials <evaluations@innovatrials.com>',
    to: recipientEmail,
    subject: `Evaluación de Centro - ${centerName}`,
    html: `
      <h2>Evaluación de Centro: ${centerName}</h2>
      <p>Estimado evaluador,</p>
      <p>Se ha generado un enlace de evaluación para el centro <strong>${centerName}</strong>.</p>
      <p>Por favor, acceda al siguiente enlace para completar la evaluación:</p>
      <p><a href="${link}" style="background: #004a99; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Acceder a Evaluación</a></p>
      <p>O copie y pegue este enlace en su navegador:</p>
      <p>${link}</p>
      <p>Token: <code>${token}</code></p>
      <br/>
      <p>Saludos,<br/>Equipo Innova Trials</p>
    `
  })
  */
  
  console.log(`📧 Email would be sent to ${recipientEmail} for ${centerName}`)
  console.log(`Link: ${link}`)
  return true
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { center_id, evaluator_email } = body

    if (!center_id) {
      return NextResponse.json(
        { error: "Missing center_id" },
        { status: 400 }
      )
    }

    // ✅ Get center information
    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("name, contact_email")
      .eq("id", center_id)
      .single()

    if (centerError || !center) {
      return NextResponse.json(
        { error: "Center not found" },
        { status: 404 }
      )
    }

    // ✅ 1. Check existing pending evaluation
    const { data: existing } = await supabase
      .from("evaluations")
      .select("token")
      .eq("center_id", center_id)
      .eq("status", "pending")
      .single()

    if (existing?.token) {
      // Update center's public_token if not set
      await supabase
        .from("centers")
        .update({ public_token: existing.token })
        .eq("id", center_id)

      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/cliente/${existing.token}`
      
      // Resend email
      const recipientEmail = evaluator_email || center.contact_email
      if (recipientEmail) {
        await sendEvaluationEmail(recipientEmail, center.name, existing.token, link)
      }

      return NextResponse.json({
        token: existing.token,
        link,
        reused: true,
      })
    }

    // ✅ 2. Create new evaluation token
    const token = randomUUID()

    const { error: insertError } = await supabase
      .from("evaluations")
      .insert([
        {
          token,
          center_id,
          evaluator_email: evaluator_email || null,
          status: "pending",
        },
      ])

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    // ✅ 3. Update center's public_token
    await supabase
      .from("centers")
      .update({ public_token: token })
      .eq("id", center_id)

    // ✅ 4. Send email to evaluator/contact
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/cliente/${token}`
    const recipientEmail = evaluator_email || center.contact_email
    
    if (recipientEmail) {
      await sendEvaluationEmail(recipientEmail, center.name, token, link)
    }

    return NextResponse.json({
      token,
      link,
      reused: false,
      email_sent: !!recipientEmail
    })
  } catch (err) {
    console.error("Error in create-evaluation-link:", err)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}