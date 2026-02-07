"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { calculateWeightedScore } from "@/lib/scoring/calculator"
import { Criterion as TypeCriterion, Center as TypeCenter } from "@/types"
import { 
  Sparkles, 
  Building2, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  Send,
  Upload,
  X,
  Loader2,
  Paperclip
} from "lucide-react"

/* =========================
   Supabase client (singleton)
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================
   Types
========================= */
type Attachment = {
  file_name: string
  file_path: string
}

type AttachmentState = {
  data?: Attachment
  uploading: boolean
  error?: string
}

type Props = {
  token: string
  center: TypeCenter
  criteria: TypeCriterion[]
}

export default function ClientEvaluation({ token, center, criteria }: Props) {
  // Wizard steps
  const [step, setStep] = useState<'terms' | 'info' | 'evaluation' | 'review' | 'success'>('terms')
  
  // Form state
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [email, setEmail] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [generalNotes, setGeneralNotes] = useState('')
  
  // Attachments state (per criterion)
  const [attachments, setAttachments] = useState<Record<string, AttachmentState>>({})
  
  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Group criteria by category
  const categories = criteria.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, TypeCriterion[]>)

  const categoryList = Object.entries(categories)

  /* =========================
     Score handlers
  ========================= */
  function handleScoreChange(criterionId: string, value: number) {
    setScores(prev => ({ ...prev, [criterionId]: value }))
  }

  function calculateProgress(): number {
    const scored = Object.keys(scores).length
    return criteria.length > 0 ? Math.round((scored / criteria.length) * 100) : 0
  }

  function getCurrentScoringResult() {
    const scoringInput = Object.entries(scores).map(([id, score]) => ({
      criterion_id: id,
      score
    }))
    return calculateWeightedScore(scoringInput, criteria)
  }

  /* =========================
     Attachment handlers
  ========================= */
  async function handleAttachmentUpload(criterionId: string, file?: File) {
    if (!file) return

    // Set uploading state
    setAttachments(prev => ({
      ...prev,
      [criterionId]: { uploading: true }
    }))

    try {
      // Sanitize filename (remove special chars, keep extension)
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
      const filePath = `pending/${center.id}/${criterionId}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("evaluation-attachments")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Success
      setAttachments(prev => ({
        ...prev,
        [criterionId]: {
          uploading: false,
          data: {
            file_name: file.name,
            file_path: filePath
          }
        }
      }))
    } catch (err: any) {
      setAttachments(prev => ({
        ...prev,
        [criterionId]: {
          uploading: false,
          error: err.message || 'Upload failed'
        }
      }))
    }
  }

  async function handleAttachmentRemove(criterionId: string) {
    const attachment = attachments[criterionId]?.data
    if (!attachment) return

    try {
      await supabase.storage
        .from("evaluation-attachments")
        .remove([attachment.file_path])
    } catch (err) {
      // Ignore delete errors - file might already be gone
    }

    setAttachments(prev => {
      const next = { ...prev }
      delete next[criterionId]
      return next
    })
  }

  /* =========================
     Submit handler
  ========================= */
  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      // Build attachments payload (only successful uploads)
      const attachmentsPayload: Record<string, Attachment> = {}
      Object.entries(attachments).forEach(([id, state]) => {
        if (state.data) {
          attachmentsPayload[id] = state.data
        }
      })

      const res = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          evaluator_email: email,
          responses: scores,
          notes,
          generalNotes,
          attachments: attachmentsPayload,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit evaluation')
      }

      setStep('success')
    } catch (err: any) {
      setError(err.message)
    }

    setSubmitting(false)
  }

  const { totalScore: currentScore, status: currentStatus } = getCurrentScoringResult()
  const attachmentCount = Object.values(attachments).filter(a => a.data).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Innova Trials</h1>
                <p className="text-xs text-slate-500">Site Self-Assessment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{center.name}</p>
              <p className="text-xs text-slate-500">{center.city}, {center.country}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['terms', 'info', 'evaluation', 'review'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s === step 
                    ? 'bg-indigo-600 text-white' 
                    : ['terms', 'info', 'evaluation', 'review'].indexOf(step) > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {['terms', 'info', 'evaluation', 'review'].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div className={`w-12 h-1 mx-1 rounded ${
                    ['terms', 'info', 'evaluation', 'review'].indexOf(step) > i
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step: Terms */}
        {step === 'terms' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Site Capability Assessment</h2>
            <div className="prose prose-slate prose-sm max-w-none mb-6">
              <p>
                This assessment is part of Innova Trials' site selection process. Sponsors and CROs 
                use these results to identify qualified sites for upcoming clinical trials.
              </p>
              <p>
                <strong>What this assessment covers:</strong>
              </p>
              <ul>
                <li>Regulatory compliance and GCP certification status</li>
                <li>Operational capacity and infrastructure</li>
                <li>Staff experience and therapeutic expertise</li>
                <li>Quality systems and audit history</li>
              </ul>
              <p>
                <strong>By completing this assessment, you confirm that:</strong>
              </p>
              <ul>
                <li>You are authorized to represent {center.name}</li>
                <li>The information provided reflects your site's current capabilities</li>
                <li>Results may be shared with sponsors evaluating sites for clinical trials</li>
              </ul>
              <p className="text-slate-500 text-xs mt-4">
                Estimated completion time: 10-15 minutes. You can upload supporting documents for each criterion.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-sm font-medium text-slate-700 cursor-pointer">
                I agree to the terms and conditions and confirm I am authorized to complete this assessment.
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep('info')}
                disabled={!acceptTerms}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-x-1"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Info */}
        {step === 'info' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Evaluator Information</h2>
            <p className="text-slate-600 mb-8">Please provide your professional contact details.</p>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="evaluator@site.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">A copy of the results will be sent to this address.</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('terms')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => setStep('evaluation')}
                disabled={!email || !/^\S+@\S+\.\S+$/.test(email)}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-x-1"
              >
                Start Assessment
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Evaluation */}
        {step === 'evaluation' && (
          <div className="space-y-8 animate-fade-in">
            {/* Progress Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24 z-10 flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">Completion Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{calculateProgress()}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>
              <div className="text-right border-l border-slate-100 pl-6">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Score</p>
                <p className={`text-2xl font-black ${
                  currentStatus === 'green' ? 'text-emerald-600' : 
                  currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {currentScore}
                </p>
              </div>
            </div>

            {/* Criteria Categories */}
            {categoryList.map(([category, catCriteria]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  {category}
                </h3>
                <div className="grid gap-4">
                  {catCriteria.map((criterion) => (
                    <div key={criterion.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-1">{criterion.name}</h4>
                            <p className="text-sm text-slate-500 mb-4">{criterion.description}</p>
                            
                            {/* Score Options */}
                            <div className="flex flex-wrap gap-2">
                              {[0, 25, 50, 75, 100].map((val) => (
                                <button
                                  key={val}
                                  onClick={() => handleScoreChange(String(criterion.id), val)}
                                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    scores[String(criterion.id)] === val
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Attachments Section */}
                          <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Paperclip className="w-3 h-3" />
                                Supporting Evidence
                              </p>
                              
                              {attachments[String(criterion.id)]?.data ? (
                                <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-xs font-medium text-slate-700 truncate flex-1">
                                    {attachments[String(criterion.id)].data?.file_name}
                                  </span>
                                  <button 
                                    onClick={() => handleAttachmentRemove(String(criterion.id))}
                                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                                  {attachments[String(criterion.id)]?.uploading ? (
                                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                      <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Upload PDF/Image</span>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleAttachmentUpload(String(criterion.id), e.target.files?.[0])}
                                    disabled={attachments[String(criterion.id)]?.uploading}
                                  />
                                </label>
                              )}
                              {attachments[String(criterion.id)]?.error && (
                                <p className="text-[10px] text-red-500 mt-2 font-medium">
                                  {attachments[String(criterion.id)].error}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-black text-slate-900 mb-4">Additional Comments</h3>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Any additional information you would like to share..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
              />
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <button
                onClick={() => setStep('info')}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Progress</p>
                  <p className="text-sm font-black text-slate-900">{Object.keys(scores).length} of {criteria.length} scored</p>
                </div>
                <button
                  onClick={() => setStep('review')}
                  disabled={Object.keys(scores).length < criteria.length}
                  className="btn-primary flex items-center gap-2 px-10 py-4 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-x-1 shadow-lg shadow-indigo-200"
                >
                  Review Submission
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Final Review</h2>
            <p className="text-slate-600 mb-8">Please review your assessment before final submission.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Final Score</p>
                <p className={`text-4xl font-black ${
                  currentStatus === 'green' ? 'text-emerald-600' : 
                  currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {currentScore}
                </p>
                <p className="text-xs font-bold mt-1 opacity-70">
                  {currentStatus === 'green' ? '✓ Approved' : 
                   currentStatus === 'yellow' ? '⚠ Conditional' : '✕ Not Approved'}
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Evaluator</p>
                <p className="text-sm font-bold text-slate-900 truncate">{email}</p>
                <p className="text-xs text-slate-500 mt-1">{center.name}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attachments</p>
                <p className="text-4xl font-black text-slate-900">{attachmentCount}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Files uploaded</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl mb-8 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep('evaluation')}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-3 px-12 py-4 rounded-xl font-black disabled:opacity-50 transition-all hover:scale-105 shadow-xl shadow-indigo-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="max-w-2xl mx-auto text-center py-12 animate-scale-in">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
              <Check className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Assessment Submitted!</h2>
            <p className="text-lg text-slate-600 mb-12">
              Thank you for completing the site capability assessment for {center.name}. 
              The results have been sent to your email and shared with the selection committee.
            </p>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Your Final Rating</p>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase">Score</p>
                  <p className="text-5xl font-black text-slate-900">{currentScore}</p>
                </div>
                <div className="w-px h-16 bg-slate-100" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase">Status</p>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black inline-block ${
                    currentStatus === 'green' ? 'bg-emerald-100 text-emerald-700' : 
                    currentStatus === 'yellow' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {currentStatus === 'green' ? 'APPROVED' : 
                     currentStatus === 'yellow' ? 'CONDITIONAL' : 'NOT APPROVED'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} Innova Trials. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
