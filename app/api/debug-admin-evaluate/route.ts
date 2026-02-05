import { NextResponse } from "next/server"

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  async function test(table: string) {
    const res = await fetch(`${base}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    })

    const data = await res.json()

    return {
      table,
      ok: res.ok,
      status: res.status,
      data,
    }
  }

  const results = await Promise.all([
    test("evaluation_items"),
    test("evaluation_criteria"),
    test("client_submissions"),
    test("client_submission_items"),
    test("detailed_evaluations"),
    test("disclaimer_config"),
  ])

  return NextResponse.json(results)
}
