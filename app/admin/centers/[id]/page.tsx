"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import { generateCenterReport } from "@/lib/utils/pdf-generator"
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
  User,
  Activity,
  XCircle,
  AlertTriangle,
  Info,
  Printer
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
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [centerRes, evalRes, criteriaRes] = await Promise.all([
        supabase.from("centers").select("*").eq("id", id).single(),
        supabase.from("evaluations").select("*").eq("center_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("criteria").select("*").order("id", { ascending: true })
      ])

      if (centerRes.data) setCenter(centerRes.data)
      if (evalRes.data) setEvaluation(evalRes.data)
      if (criteriaRes.data) setCriteria(criteriaRes.data)
      setLoading(false)
    }
    if (id) loadData()
  }, [id, supabase])

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateCenterReport(center, evaluation, criteria)
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("Failed to generate PDF report.")
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  if (!center) return (
    <div className="text-center py-20">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold">Center not found</h2>
      <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
    </div>
  )

  let responses: Record<string, any> = {}
  let attachments: Record<string, any> = {}

  if (evaluation?.responses) {
    const raw = evaluation.responses
    if (raw.scores) {
      responses = raw.scores
      attachments = raw.attachments || {}
    } else {
      responses = raw
    }
  }

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'green': return 'text-green-600 bg-green-50 border-green-100'
      case 'yellow': return 'text-amber-600 bg-amber-50 border-amber-100'
      case 'red': return 'text-red-600 bg-red-50 border-red-100'
      default: return 'text-slate-500 bg-slate-50 border-slate-100'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => router.push('/admin/centers')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Centers
        </button>
        
        {evaluation && (
          <button 
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-100"
          >
            {generatingPDF ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Download PDF Report
          </button>
        )}
      </div>

      <div className="card overflow-hidden border-t-4 border-t-primary-600">
        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
              <Building2 className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">{center.name}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{center.code} • {center.city}, {center.country}</p>
              </div>
              {evaluation && (
                <div className={`px-6 py-4 rounded-2xl border flex items-center gap-4 ${getScoreColor(evaluation.score_level)}`}>
                  <div className="text-center border-r pr-4 border-current/20">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Final Score</p>
                    <p className="text-3xl font-black leading-none">{evaluation.total_score ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                    {evaluation.score_level === 'green' ? <CheckCircle2 className="w-5 h-5" /> : 
                     evaluation.score_level === 'yellow' ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {evaluation.score_level === 'green' ? 'Approved' : 
                     evaluation.score_level === 'yellow' ? 'Conditional' : evaluation.score_level === 'red' ? 'Not Approved' : 'Completed'}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><User className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</p>
                  <p className="text-sm font-bold text-slate-700">{center.contact_name || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-sm font-bold text-slate-700">{center.contact_email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Last Submission</p>
                  <p className="text-sm font-bold text-slate-700">{evaluation ? new Date(evaluation.created_at).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Evaluation Responses
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{criteria.length} Questions</span>
            </div>
            
            {!evaluation ? (
              <div className="p-20 text-center">
                <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No evaluation data available for this site yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {criteria.map((c, i) => {
                  const ans = responses[c.id] || responses[String(c.id)]
                  const hasAttach = attachments[c.id] || attachments[String(c.id)]
                  return (
                    <div key={c.id} className="p-8 hover:bg-slate-50/50 transition-colors space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <span className="text-slate-300 font-black text-xl leading-none">{(i + 1).toString().padStart(2, '0')}</span>
                          <h4 className="font-bold text-slate-800 leading-snug">{c.name}</h4>
                        </div>
                        {c.response_type === 'boolean' && (
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                            ans === 'yes' ? 'border-green-500 text-green-700 bg-green-50' : 
                            ans === 'no' ? 'border-red-500 text-red-700 bg-red-50' : 'border-slate-200 text-slate-400'
                          }`}>
                            {ans || 'No Answer'}
                          </span>
                        )}
                      </div>
                      {typeof ans === 'string' && ans !== 'yes' && ans !== 'no' && ans !== 'na' && (
                        <div className="ml-10 p-4 bg-white border border-slate-100 rounded-xl shadow-sm italic text-slate-600 text-sm leading-relaxed">
                          "{ans}"
                        </div>
                      )}
                      {hasAttach && (
                        <div className="ml-10">
                          <a href={hasAttach} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100 hover:bg-primary-100 transition-all">
                            <Download className="w-3 h-3" />
                            View Supporting Document
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-slate-900 border-b pb-4">Evaluation Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Scoring Questions</span>
                <span className="font-bold text-slate-900">{criteria.filter(c => c.response_type === 'boolean').length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Development Questions</span>
                <span className="font-bold text-slate-900">{criteria.filter(c => c.response_type === 'text').length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Files Uploaded</span>
                <span className="font-bold text-primary-600">{Object.keys(attachments).length}</span>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Attachments</h3>
              <FileIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4 space-y-2">
              {Object.keys(attachments).length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-medium italic">No files attached to this evaluation.</p>
              ) : (
                Object.entries(attachments).map(([cid, url]: [any, any]) => {
                  const crit = criteria.find(c => c.id === parseInt(cid))
                  return (
                    <a key={cid} href={url} target="_blank" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
                      <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{crit?.name || 'Attachment'}</p>
                        <p className="text-xs font-bold text-slate-700 truncate">Download File</p>
                      </div>
                    </a>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
