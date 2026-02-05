"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
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
type Center = {
  id: string
  name: string
  code: string
  city: string
  country: string
}

type Criterion = {
  id: number | string
  name: string
  description: string
  weight: number
  category: string
  order: number
}

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
  center: Center
  criteria: Criterion[]
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
  }, {} as Record<string, Criterion[]>)

  const categoryList = Object.entries(categories)

  /* =========================
     Score handlers
  ========================= */
  function handleScoreChange(criterionId: string, value: number) {
    setScores(prev => ({ ...prev, [criterionId]: value }))
  }

  function calculateProgress(): number {
    const scored = Object.keys(scores).length
    return Math.round((scored / criteria.length) * 100)
  }

  function calculateScore(): { total: number; status: string } {
    const scoredCriteria = Object.entries(scores)
    if (scoredCriteria.length === 0) return { total: 0, status: 'pending' }

    let weightedSum = 0
    let totalWeight = 0

    scoredCriteria.forEach(([criterionId, score]) => {
      const criterion = criteria.find(c => String(c.id) === criterionId)
      if (criterion) {
        weightedSum += score * criterion.weight
        totalWeight += criterion.weight
      }
    })

    const total = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
    const status = total >= 80 ? 'green' : total >= 60 ? 'yellow' : 'red'

    return { total, status }
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
      const { total, status } = calculateScore()

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
  token, // ✅ ESTE ES EL CAMBIO IMPORTANTE
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

  const { total: currentScore, status: currentStatus } = calculateScore()
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
            
            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                I have read and agree to the terms and conditions outlined above
              </span>
            </label>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep('info')}
                disabled={!acceptTerms}
                className="btn-primary flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Info */}
        {step === 'info' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Contact Information</h2>
            <p className="text-slate-600 mb-6">
              We'll use this to send you a copy of your assessment results and to coordinate any follow-up questions.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@yoursite.com"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Your email will not be shared with third parties without your consent.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900">{center.name}</p>
                    <p className="text-sm text-indigo-700">{center.city}, {center.country}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep('terms')} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep('evaluation')}
                disabled={!email || !email.includes('@')}
                className="btn-primary flex items-center gap-2"
              >
                Start Evaluation
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Evaluation */}
        {step === 'evaluation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-500">Progress</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Object.keys(scores).length} / {criteria.length} criteria
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Current Score</p>
                  <p className={`text-2xl font-bold ${
                    currentStatus === 'green' ? 'text-emerald-600' :
                    currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScore}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              {attachmentCount > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  <Paperclip className="w-3 h-3 inline mr-1" />
                  {attachmentCount} document{attachmentCount !== 1 ? 's' : ''} attached
                </p>
              )}
            </div>

            {/* Categories */}
            {categoryList.map(([category, categoryCriteria]) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">{category}</h3>
                  <p className="text-sm text-slate-500">
                    {categoryCriteria.filter(c => scores[String(c.id)] !== undefined).length} / {categoryCriteria.length} completed
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {categoryCriteria.map((criterion) => {
                    const criterionId = String(criterion.id)
                    const attachmentState = attachments[criterionId]
                    
                    return (
                      <div key={criterionId} className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{criterion.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{criterion.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scores[criterionId] ?? ''}
                              onChange={(e) => handleScoreChange(criterionId, Number(e.target.value))}
                              className="w-20 input text-center font-bold"
                              placeholder="0-100"
                            />
                            {scores[criterionId] !== undefined && (
                              <Check className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                        </div>

                        {/* Attachment section */}
                        <div className="flex items-center gap-3 mb-2">
                          {/* Upload button */}
                          {!attachmentState?.data && !attachmentState?.uploading && (
                            <label className="flex items-center gap-1.5 text-xs text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="font-medium">Attach document</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                onChange={(e) => handleAttachmentUpload(criterionId, e.target.files?.[0])}
                              />
                            </label>
                          )}

                          {/* Uploading state */}
                          {attachmentState?.uploading && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          )}

                          {/* Uploaded file */}
                          {attachmentState?.data && (
                            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-3 py-1.5">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span className="font-medium max-w-[200px] truncate">
                                {attachmentState.data.file_name}
                              </span>
                              <button
                                onClick={() => handleAttachmentRemove(criterionId)}
                                className="text-emerald-600 hover:text-red-600 transition-colors"
                                title="Remove attachment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Upload error */}
                          {attachmentState?.error && (
                            <div className="flex items-center gap-2 text-xs text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>{attachmentState.error}</span>
                              <button
                                onClick={() => setAttachments(prev => {
                                  const next = { ...prev }
                                  delete next[criterionId]
                                  return next
                                })}
                                className="underline hover:no-underline"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Notes input */}
                        <input
                          type="text"
                          value={notes[criterionId] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [criterionId]: e.target.value }))}
                          className="input text-sm"
                          placeholder="Add notes (optional)..."
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* General Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                General Notes & Comments
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="input"
                rows={4}
                placeholder="Additional observations about your site capabilities..."
              />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('info')} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={Object.keys(scores).length === 0}
                className="btn-primary flex items-center gap-2"
              >
                Review & Submit
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Your Evaluation</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-500">Center</p>
                  <p className="font-semibold text-slate-900">{center.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-500">Criteria Scored</p>
                  <p className="font-semibold text-slate-900">{Object.keys(scores).length} / {criteria.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-500">Documents</p>
                  <p className="font-semibold text-slate-900">{attachmentCount} attached</p>
                </div>
                <div className={`p-4 rounded-xl ${
                  currentStatus === 'green' ? 'bg-emerald-50' :
                  currentStatus === 'yellow' ? 'bg-amber-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm text-slate-500">Total Score</p>
                  <p className={`text-2xl font-bold ${
                    currentStatus === 'green' ? 'text-emerald-600' :
                    currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScore}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Criterion</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Score</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {criteria.filter(c => scores[String(c.id)] !== undefined).map((criterion) => {
                      const criterionId = String(criterion.id)
                      const attachment = attachments[criterionId]?.data
                      
                      return (
                        <tr key={criterionId}>
                          <td className="py-3 px-4 text-sm text-slate-700">{criterion.name}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              scores[criterionId] >= 80 ? 'text-emerald-600' :
                              scores[criterionId] >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {scores[criterionId]}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {attachment ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <Paperclip className="w-3 h-3" />
                                {attachment.file_name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep('evaluation')} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Edit Responses
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Your site profile has been updated. We'll notify you when sponsors are evaluating 
              sites for studies that match your capabilities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Your Score</p>
                <p className={`text-2xl font-bold ${
                  currentStatus === 'green' ? 'text-emerald-600' :
                  currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {currentScore}/100
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Status</p>
                <p className={`text-lg font-semibold ${
                  currentStatus === 'green' ? 'text-emerald-600' :
                  currentStatus === 'yellow' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {currentStatus === 'green' ? 'Qualified' :
                   currentStatus === 'yellow' ? 'Conditional' : 'Needs Improvement'}
                </p>
              </div>
            </div>

            <div className="text-left p-4 rounded-xl bg-indigo-50 border border-indigo-100 max-w-md mx-auto mb-6">
              <p className="font-medium text-indigo-900 mb-2">What happens next?</p>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• You'll receive a detailed report at {email}</li>
                <li>• Your profile is now visible to sponsors seeking sites</li>
                <li>• Update your assessment anytime to reflect changes</li>
              </ul>
            </div>

            <p className="text-sm text-slate-500">
              Questions? Contact us at <a href="mailto:sites@innovatrials.com" className="text-indigo-600 hover:underline">sites@innovatrials.com</a>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Innova Trials. All rights reserved.
      </footer>
    </div>
  )
}
