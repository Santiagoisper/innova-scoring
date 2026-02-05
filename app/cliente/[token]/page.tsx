import ClientEvaluation from "./ClientEvaluation"

async function getCenterByToken(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/centers?public_token=eq.${token}&select=id,name,code,city,country`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!data || data.length === 0) return null
  return data[0]
}

async function getCriteria() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/criteria?select=*&order=order.asc`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    }
  )

  return res.json()
}

export default async function ClienteTokenPage({
  params,
}: {
  params: { token: string }
}) {
  const token = params.token

  const [center, criteria] = await Promise.all([
    getCenterByToken(token),
    getCriteria(),
  ])

  if (!center) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full text-center bg-white border rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-slate-600 mb-6">
            This evaluation link is invalid or has expired.
          </p>
          <a
            href="/"
            className="text-indigo-600 hover:underline font-medium"
          >
            ← Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <ClientEvaluation
      token={token}
      center={center}
      criteria={criteria}
    />
  )
}
