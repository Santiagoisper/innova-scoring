import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: Request) {
  const res = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.headers.get("cookie")
            ? req.headers
                .get("cookie")!
                .split(";")
                .map(c => {
                  const [name, ...rest] = c.trim().split("=")
                  return { name, value: rest.join("=") }
                })
            : []
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const body = await req.json()
  const { access_token, refresh_token } = body

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
  }

  await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  return res
}
