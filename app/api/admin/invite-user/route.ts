import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()

    const supabaseSession = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {}
        }
      }
    )

    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check role
    const { data: profile } = await supabaseSession
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { email, role } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    if (!role || !["admin", "evaluator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Invite failed" }, { status: 500 })
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: data.user.id,
        email: email,
        role: role,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invited: email,
      role,
      user_id: data.user.id,
    })
  } catch (err: any) {
    console.error("Invite user error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
