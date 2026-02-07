"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import { generateCenterReport } from "@/lib/utils/pdf-generator"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  RefreshCw,
  Download,
  AlertCircle,
  FileIcon,
  User,
  Activity,
  XCircle,
  AlertTriangle,
  Info,
  Printer,
  FileCheck,
  ChevronRight,
  Globe,
  Phone,
  MapPin
} from "lucide-react"

export default function CenterDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const id = params.id as string

  const [center, setCenter] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [criteria, setCriteria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true)
      try {
        const [centerRes, evalRes, criteriaRes] = await Promise.all([
          supabase.from("centers").select("*").eq("id", id).single(),
          supabase.from("evaluations").select("*").eq("center_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("criteria").select("*").order("id", { ascending: true })
        ])

        if (centerRes.data) setCenter(centerRes.data)
        if (evalRes.data) setEvaluation(evalRes.data)
        if (criteriaRes.data) setCriteria(criteriaRes.data)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, supabase])

  const handleDownloadPDF = async () => {
    if (!center || !evaluation) return
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

  // Extract Responses & Attachments
  const { responses, attachments } = useMemo(() => {
    let res: Record<string, any> = {}
    let att: Record<string, any> = {}

    if (evaluation?.responses) {
      const raw = evaluation.responses
      if (raw.scores) {
        res = raw.scores
        att = raw.attachments || {}
      } else {
        res = raw
        Object.entries(raw).forEach(([key, value]) => {
          if (typeof value === 'string' && value.startsWith('http')) {
            att[key] = value
          }
        })
      }
    }
    return { responses: res, attachments: att }
  }, [evaluation])

  const getStatusDisplay = (level: string) => {
    switch (level) {
      case 'green': return { label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 className="w-5 h-5" /> }
      case 'yellow': return { label: 'Conditional', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AlertTriangle className="w-5 h-5" /> }
      case 'red': return { label: 'Not Approved', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <XCircle className="w-5 h-5" /> }
      default: return { label: 'In Review', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: <Info className="w-5 h-5" /> }
    }
  }

  const status = getStatusDisplay(evaluation?.score_level)

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Site Intelligence...</p>
    </div>
  )

  if (!center) return (
    <div className="max-w-md mx-auto mt-20 text-center p-12 card border-rose-100">
      <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
      <h2 className="text-2xl font-black text-slate-900">Site Not Found</h2>
      <p className="text-slate-500 mt-2 mb-8">The requested research site could not be located in our global database.</p>
      <button onClick={() => router.push('/admin/centers')} className="btn-primary w-full py-4">Return to Global Directory</button>
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-24 px-4 sm:px-6">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <button 
          onClick={() => router.push('/admin/centers')}
          className="group flex items-center gap-3 text-slate-400 hover:text-primary-600 transition-all"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-primary-100 group-hover:shadow-primary-50">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Back to Directory</span>
        </button>
        
        {evaluation && (
          <button 
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn-primary flex items-center gap-3 px-8 py-4 shadow-xl shadow-primary-100 group"
          >
            {generatingPDF ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            <span className="font-black uppercase tracking-widest text-xs">Generate Site Report</span>
          </button>
        )}
      </div>

      {/* Main Header Card */}
      <div className="card overflow-hidden border-none shadow-2xl shadow-slate-200/50 bg-white">
        <div className="h-2 bg-gradient-to-r from-primary-600 via-primary-400 to-indigo-600" />
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Site Icon & Main Info */}
            <div className="flex flex-col sm:flex-row gap-8 flex-1">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-slate-900/20 rotate-3">
                  <Building2 className="w-12 h-12 text-white -rotate-3" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      ID: {center.code}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Globe className="w-3 h-3" />
                      {center.country}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                    {center.name}
                  </h1>
                  <p className="text-slate-400 font-bold text-lg mt-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    {center.city}, {center.address || 'Location Pending'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Principal Contact</p>
                      <p className="text-sm font-bold text-slate-700">{center.contact_name || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Email Access</p>
                      <p className="text-sm font-bold text-slate-700">{center.contact_email || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Score & Status */}
            {evaluation && (
              <div className="lg:w-72 flex flex-col justify-center">
                <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4 transition-all hover:scale-105 ${status.color} shadow-xl shadow-current/5`}>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Global Quality Score</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-black tracking-tighter">{evaluation.total_score ?? '0'}</span>
                      <span className="text-xl font-bold opacity-40">/100</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-current opacity-10" />
                  <div className="flex items-center gap-3 font-black uppercase tracking-[0.15em] text-xs">
                    {status.icon}
                    {status.label}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Assessment Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card border-none shadow-xl shadow-slate-200/40">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary-600" />
                Technical Assessment Findings
              </h3>
              <div className="px-4 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{criteria.length} Parameters Evaluated</span>
              </div>
            </div>
            
            {!evaluation ? (
              <div className="p-24 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Info className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Assessment Data Found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {criteria.map((c, i) => {
                  const ans = responses[c.id] || responses[String(c.id)]
                  const hasAttach = attachments[c.id] || attachments[String(c.id)]
                  const isYes = String(ans).toLowerCase() === 'yes'
                  const isNo = String(ans).toLowerCase() === 'no'
                  
                  return (
                    <div key={c.id} className="p-8 md:p-10 hover:bg-slate-50/30 transition-all group">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex gap-6 flex-1">
                          <span className="text-slate-100 font-black text-5xl leading-none transition-colors group-hover:text-primary-50">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="space-y-3">
                            <h4 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors">
                              {c.name}
                            </h4>
                            {c.critical && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                <AlertCircle className="w-3 h-3" />
                                Critical Requirement
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                          {c.response_type === 'boolean' ? (
                            <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 shadow-sm ${
                              isYes ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 
                              isNo ? 'border-rose-500 text-rose-700 bg-rose-50' : 'border-slate-100 text-slate-400 bg-white'
                            }`}>
                              {ans ? String(ans).toUpperCase() : 'PENDING'}
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                              Open Response
                            </div>
                          )}
                          {c.response_type === 'boolean' && ans && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              Contribution: <span className={isYes ? 'text-emerald-600' : 'text-slate-500'}>{isYes ? `+${c.weight}` : '0'} pts</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Development Text Content */}
                      {typeof ans === 'string' && !['yes', 'no', 'na'].includes(ans.toLowerCase()) && ans.trim() !== "" && (
                        <div className="mt-6 ml-0 md:ml-20 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative">
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-400">
                            Site Statement
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed italic">"{ans}"</p>
                        </div>
                      )}

                      {/* Attachment Link */}
                      {hasAttach && (
                        <div className="mt-6 ml-0 md:ml-20">
                          <a 
                            href={hasAttach} 
                            target="_blank" 
                            className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-primary-600 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all group/btn"
                          >
                            <div className="p-1.5 bg-primary-50 rounded-lg group-hover/btn:bg-primary-600 group-hover/btn:text-white transition-colors">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            View Evidence Document
                            <Download className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="card p-8 space-y-8 border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm border-b border-slate-50 pb-4">Audit Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Parameters</span>
                <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-900 group-hover:bg-primary-50 transition-colors">
                  {criteria.length}
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Critical Criteria</span>
                <span className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-black text-rose-600 group-hover:bg-rose-100 transition-colors">
                  {criteria.filter(c => c.critical).length}
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Documents Verified</span>
                <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  {Object.keys(attachments).length}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Innova Trials Official Record</p>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold">{evaluation ? new Date(evaluation.created_at).toLocaleString() : 'Pending Submission'}</span>
              </div>
            </div>
          </div>

          <div className="card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/50">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black leading-tight">Need to Update Assessment?</h4>
                <p className="text-slate-400 text-xs leading-relaxed">You can modify the scoring weights or technical parameters in the global setup panel.</p>
              </div>
              <button 
                onClick={() => router.push('/admin/criteria')}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors"
              >
                Go to Evaluation Setup
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
