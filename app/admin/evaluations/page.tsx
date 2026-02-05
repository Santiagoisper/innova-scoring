"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { Clock, CheckCircle, ExternalLink } from "lucide-react"

type Evaluation = {
  id: string
  status: string
  total_score: number | null
  score_level: string | null
  created_at: string
  center_id: string
  centers?: {
    name: string
    city: string
    country: string
  }
}

export default function AdminEvaluationsPage() {
  const supabase = supabaseBrowser()

  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  async function loadEvaluations() {
    setLoading(true)

    const { data, error } = await supabase
      .from("evaluations")
      .select("*, centers(name,city,country)")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEvaluations(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadEvaluations()
  }, [])

  function badge(level: string | null) {
    if (level === "green") return "bg-emerald-100 text-emerald-700"
    if (level === "yellow") return "bg-amber-100 text-amber-700"
    if (level === "red") return "bg-red-100 text-red-700"
    return "bg-slate-100 text-slate-600"
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading evaluations...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Sponsor Evaluations
      </h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4">Center</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Level</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {evaluations.map((e) => (
              <tr key={e.id} className="border-b hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-medium text-slate-900">
                    {e.centers?.name || "Unknown Center"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.centers?.city}, {e.centers?.country}
                  </p>
                </td>

                <td className="p-4">
                  {e.status === "pending" ? (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                </td>

                <td className="p-4 font-bold">
                  {e.total_score ?? "—"}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${badge(
                      e.score_level
                    )}`}
                  >
                    {e.score_level || "—"}
                  </span>
                </td>

                <td className="p-4">
                  <a
                    href={`/admin/evaluations/${e.id}`}
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {evaluations.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            No evaluations yet.
          </div>
        )}
      </div>
    </div>
  )
}
