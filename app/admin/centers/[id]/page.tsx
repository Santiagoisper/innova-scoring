"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ExternalLink,
  Download,
  AlertCircle,
  FileIcon,
} from "lucide-react"

export default function CenterDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = supabaseBrowser()
  const id = params.id as string

  const [center, setCenter] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [criteria, setCriteria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const [centerRes, evalRes, criteriaRes] = await Promise.all([
        supabase.from("centers").select("*").eq("id", id).single(),
        supabase.from("evaluations").select("*").eq("center_id", id).order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("criteria").select("*").order("id", { ascending: true })
      ])

      if (centerRes.data) setCenter(centerRes.data)
      if (evalRes.data) setEvaluation(evalRes.data)
      if (criteriaRes.data) setCriteria(criteriaRes.data)

      setLoading(false)
    }

    if (id) loadData()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!center) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Center not found</h2>
        <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
      </div>
    )
  }

  const responses = evaluation?.responses?.scores || {}
  const attachments = evaluation?.responses?.attachments || {}

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Centers
      </button>

      {/* Header Card */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 border-l-4 border-l-primary-600">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 font-display">{center.name}</h1>
                <p className="text-slate-500 font-medium">Code: {center.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {center.city}, {center.country}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {center.contact_email || "No email provided"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {center.contact_phone || "No phone provided"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Created: {new Date(center.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Final Score</p>
            <div className="text-5xl font-black text-slate-900 mb-2">
              {evaluation?.total_score ?? "—"}
            </div>
            {evaluation?.score_level && (
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                evaluation.score_level === 'green' ? 'bg-green-100 text-green-700' :
                evaluation.score_level === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {evaluation.score_level === 'green' ? 'Approved' :
                 evaluation.score_level === 'yellow' ? 'Conditional' : 'Not Approved'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Questionnaire Responses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Evaluation Responses
          </h2>

          {!evaluation ? (
            <div className="card p-12 text-center text-slate-500">
              <p>No evaluation data available for this center yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {criteria.map((c) => {
                const answer = responses[c.id]
                const attachment = attachments[c.id]
                
                return (
                  <div key={c.id} className="card p-5 hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">Criterion {c.id}</p>
                        <h3 className="font-semibold text-slate-900 leading-tight">{c.name}</h3>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {typeof answer === 'number' ? (
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            answer === 100 ? 'bg-green-100 text-green-700' :
                            answer === 0 ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {answer === 100 ? 'YES' : answer === 0 ? 'NO' : 'N/A'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">
                            Development
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Development Text */}
                    {typeof answer === 'string' && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm italic">
                        "{answer}"
                      </div>
                    )}

                    {/* Attachment Link */}
                    {attachment && (
                      <div className="mt-4 flex items-center gap-2">
                        <a 
                          href={attachment} 
                          target="_blank" 
                          className="flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          View Attached Document
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Files & Meta */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            Summary & Files
          </h2>

          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">All Attachments</h3>
              <div className="space-y-3">
                {Object.keys(attachments).length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No files uploaded.</p>
                ) : (
                  Object.entries(attachments).map(([cid, url]: [string, any]) => (
                    <a 
                      key={cid}
                      href={url}
                      target="_blank"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white">
                        <FileIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Doc for Criterion {cid}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Click to open</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary-400" />
                    </a>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Submission Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-slate-900 uppercase">{evaluation?.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted at</span>
                  <span className="font-bold text-slate-900">
                    {evaluation?.updated_at ? new Date(evaluation.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Evaluator</span>
                  <span className="font-bold text-slate-900 truncate max-w-[120px]">
                    {evaluation?.evaluator_email || 'System'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
