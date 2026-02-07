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
  Paperclip,
  FileText,
  File as FileIcon
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
  const [responses, setResponses] = useState<Record<string, any>>({}) // Can be number (score) or string (text)
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
     Response handlers
  ========================= */
  function handleResponseChange(criterionId: string, value: any) {
    setResponses(prev => ({ ...prev, [criterionId]: value }))
  }

  function calculateProgress(): number {
    const answered = Object.keys(responses).length
    return criteria.length > 0 ? Math.round((answered / criteria.length) * 100) : 0
  }

  function getCurrentScoringResult() {
    // Only use numeric scores for calculation
    const scoringInput = Object.entries(responses)
      .filter(([id, val]) => typeof val === 'number')
      .map(([id, score]) => ({
        criterion_id: id,
        score: score as number
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
      // Sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
      const filePath = `client-uploads/${center.id}/${criterionId}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("site-documents")
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
        .from("site-documents")
        .remove([attachment.file_path])
    } catch (err) {
      // Ignore delete errors
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
          responses,
          notes,
          generalNotes,
          attachments: attachmentsPayload,
          disclaimer_accepted: acceptTerms
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
                <p className="text-xs text-slate-500">Site Assessment Portal</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Site Capability Disclaimer</h2>
            <div className="prose prose-slate prose-sm max-w-none mb-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-800">Please read and accept the following terms before proceeding:</p>
              <p>
                1. <strong>Accuracy of Information:</strong> By completing this assessment, you confirm that all information provided is accurate, current, and reflects the true capabilities of <strong>{center.name}</strong>.
              </p>
              <p>
                2. <strong>Authorization:</strong> You confirm that you are authorized by the institution to provide this information for the purpose of clinical trial site selection.
              </p>
              <p>
                3. <strong>Data Sharing:</strong> You understand that the responses and documents provided will be stored in our secure database and shared with Sponsors and CROs evaluating sites for clinical research.
              </p>
              <p>
                4. <strong>Supporting Documentation:</strong> For criteria requiring documentation, please ensure that the files uploaded (PDF, Word, Excel, JPG) are clear and valid.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl mb-8 border border-indigo-100">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-sm font-bold text-indigo-900 cursor-pointer">
                I have read and I accept the terms and conditions stated above.
              </label>
            </div>

            <div className="flex justify-end">
              <button
                disabled={!acceptTerms}
                onClick={() => setStep('info')}
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold disabled:opacity-50"
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Evaluator Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Your Professional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  This email will be associated with the submission for verification purposes.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep('terms')}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                disabled={!email.includes('@')}
                onClick={() => setStep('evaluation')}
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold disabled:opacity-50"
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
            {categoryList.map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">{category}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((criterion) => (
                    <div key={criterion.id} className="p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-slate-800 font-medium leading-relaxed">
                          {criterion.name}
                          {criterion.is_knockout && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 uppercase">
                              Knock-out
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Response Area */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                          {criterion.response_type === 'text' ? (
                            <textarea
                              value={responses[criterion.id] || ''}
                              onChange={(e) => handleResponseChange(criterion.id, e.target.value)}
                              placeholder="Please describe..."
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          ) : (
                            <div className="flex gap-2">
                              {[
                                { label: 'Yes', value: 100 },
                                { label: 'No', value: 0 }
                              ].map((opt) => (
                                <button
                                  key={opt.label}
                                  onClick={() => handleResponseChange(criterion.id, opt.value)}
                                  className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                                    responses[criterion.id] === opt.value
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Attachments Area */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {criterion.requires_doc ? 'Required Document' : 'Supporting File (Optional)'}
                            </span>
                          </div>
                          
                          {attachments[criterion.id]?.data ? (
                            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-emerald-800 truncate">
                                  {attachments[criterion.id].data?.file_name}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleAttachmentRemove(criterion.id)}
                                className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={(e) => handleAttachmentUpload(criterion.id, e.target.files?.[0])}
                                disabled={attachments[criterion.id]?.uploading}
                              />
                              {attachments[criterion.id]?.uploading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Upload PDF, Word, Excel or JPG</span>
                                </>
                              )}
                            </label>
                          )}
                          {attachments[criterion.id]?.error && (
                            <p className="text-[10px] text-red-600 font-bold">{attachments[criterion.id].error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-8">
              <button
                onClick={() => setStep('info')}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-400 uppercase">Current Progress</p>
                  <p className="text-sm font-black text-slate-900">{calculateProgress()}% Complete</p>
                </div>
                <button
                  onClick={() => setStep('review')}
                  className="btn-primary px-10 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200"
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Review your Submission</h2>
            
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estimated Score</p>
                  <p className="text-2xl font-black text-indigo-600">{currentScore.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                  <p className={`text-2xl font-black ${
                    currentStatus === 'Qualified' ? 'text-emerald-600' : 
                    currentStatus === 'Review' ? 'text-amber-600' : 'text-red-600'
                  }`}>{currentStatus}</p>
                </div>
              </div>

              <div className="p-6 border border-slate-200 rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Criteria Answered</span>
                    <span className="text-slate-900 font-bold">{Object.keys(responses).length} / {criteria.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Documents Uploaded</span>
                    <span className="text-slate-900 font-bold">{Object.values(attachments).filter(a => a.data).length}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Any other information you'd like to share..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep('evaluation')}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back to Questions
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="btn-primary px-12 py-4 rounded-xl flex items-center gap-3 font-black shadow-xl shadow-indigo-200 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Submit Final Assessment
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Assessment Submitted!</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Thank you for completing the site capability assessment for <strong>{center.name}</strong>. 
              Our team will review your responses and documentation shortly.
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 inline-block text-left">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Next Steps</p>
              <ul className="text-sm text-slate-700 space-y-2 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Our CRO team will verify your documentation.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  You will be notified if additional information is required.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Qualified sites will be considered for upcoming trials.
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: white;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .btn-primary:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
