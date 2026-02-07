"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ExternalLink
} from "lucide-react"

export default function EvaluationDetailPage() {
  const supabase = supabaseBrowser()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [evaluation, setEvaluation] = useState<any>(null)

  useEffect(() => {
    async function loadAndRedirect() {
      setLoading(true)
      const { data, error } = await supabase
        .from("evaluations")
        .select("id, center_id")
        .eq("id", params.id)
        .single()

      if (!error && data) {
        setEvaluation(data)
        // Redirect to the center details page where the comprehensive view exists
        router.replace(`/admin/centers/${data.center_id}`)
      } else {
        setLoading(false)
      }
    }
    loadAndRedirect()
  }, [params.id, router, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Redirecting to Site Intelligence...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center p-12 card border-rose-100">
      <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
      <h2 className="text-2xl font-black text-slate-900">Evaluation Not Found</h2>
      <p className="text-slate-500 mt-2 mb-8">The requested evaluation record could not be located.</p>
      <button onClick={() => router.push('/admin/centers')} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>
    </div>
  )
}
