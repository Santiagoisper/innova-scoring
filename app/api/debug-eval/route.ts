import { NextResponse } from "next/server"

export async function GET() {
  const url =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
    `/rest/v1/centers?id=eq.ae433f4c-3fb1-4afe-ac3d-97ec994d8db0&select=id,name,city,country`

  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    cache: "no-store",
  })

  const data = await res.json()

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    data,
  })
}
