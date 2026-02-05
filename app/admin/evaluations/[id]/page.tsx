"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  CheckCircle,
  Paperclip,
  ArrowLeft,
  Download,
} from "lucide-react"

type Evaluation = {
  id: string
  total_score: number
  score_level: string
  status: string
  created_at: string
  responses: any
  centers?: {
    name: string
    city: string
    country: string
  }
}

export default function EvaluationDetailPage() {
  const supabase = supabaseBrowser()
  const params = useParams()

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadEvaluation() {
    setLoading(true)

    const { data, error } = await supabase
      .from("evaluations")
      .select("*, centers(name,city,country)")
      .eq("id", params.id)
      .single()

    if (!error && data) {
      setEvaluation(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadEvaluation()
  }, [])

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading evaluation...
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="p-10 text-center text-red-500">
        Evaluation not found.
      </div>
    )
  }

  const scores = evaluation.responses?.scores || {}
  const attachments = evaluation.responses?.attachments || {}

  return (
    <div className="space-y-6">

      {/* Back */}
      <a
        href="/admin/evaluations"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to evaluations
      </a>

      {/* Header */}
      <div className="bg-white border rounded-xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {evaluation.centers?.name}
          </h1>
          <p className="text-sm text-slate-500">
            {evaluation.centers?.city}, {evaluation.centers?.country}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Submitted: {new Date(evaluation.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">Final Score</p>
          <p className="text-3xl font-bold text-indigo-600">
            {evaluation.total_score}
          </p>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              evaluation.score_level === "green"
                ? "bg-emerald-100 text-emerald-700"
                : evaluation.score_level === "yellow"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {evaluation.score_level}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Criterion Scores
        </h2>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Criterion</th>
              <th className="text-left p-3">Score</th>
              <th className="text-left p-3">Attachment</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(scores).map(([criterionId, score]) => {
              const file = attachments[criterionId]

              return (
                <tr key={criterionId} className="border-b">
                  <td className="p-3 text-slate-700">
                    ID #{criterionId}
                  </td>

                  <td className="p-3 font-bold">{score as any}</td>

                  <td className="p-3">
                    {file ? (
                      <a
                        href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL
                          ?.split("//")[1]
                          .replace(
                            ".supabase.co",
                            ".supabase.co/storage/v1/object/public/evaluation-attachments/"
                          )}${file.file_path}`}
                        target="_blank"
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Paperclip className="w-4 h-4" />
                        {file.file_name}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
