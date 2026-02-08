"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { Criterion } from "@/types"
import { 
  CheckCircle2, 
  FileUp, 
  Loader2, 
  AlertCircle, 
  Info,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  FileText,
  UploadCloud,
  X
} from "lucide-react"


export default function ClientEvaluation({ token }: { token: string }) {
  const supabase = supabaseBrowser()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [submission, setSubmission] = useState<any>(null)
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [attachments, setAttachments] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        // 1. Validar Token y obtener Submission
        const { data: sub, error: subErr } = await supabase
          .from('client_submissions')
          .select('*, centers(*)')
          .eq('public_token', token)
          .single()

        if (subErr || !sub) {
          setError("Invalid or expired access token.")
          setLoading(false)
          return
        }

        setSubmission(sub)
        setDisclaimerAccepted(sub.disclaimer_accepted)

        // 2. Cargar Criterios
        const { data: crit, error: critErr } = await supabase
          .from('criteria')
          .select('*')
          .order('id', { ascending: true })

        if (critErr) throw critErr
        setCriteria(crit)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token, supabase])

  const handleAcceptDisclaimer = async () => {
    try {
      const { error } = await supabase
        .from('client_submissions')
        .update({ 
          disclaimer_accepted: true,
          disclaimer_accepted_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error
      setDisclaimerAccepted(true)
    } catch (err: any) {
      alert("Error accepting disclaimer: " + err.message)
    }
  }

  const handleFileUpload = async (criterionId: number, file: File) => {
    if (!submission?.id) return
    
    setUploading(prev => ({ ...prev, [criterionId]: true }))
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${submission.id}/${criterionId}/${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `submissions/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('site-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('site-documents')
        .getPublicUrl(filePath)

      setAttachments(prev => ({ ...prev, [criterionId]: publicUrl }))
    } catch (err: any) {
      alert("Upload failed: " + err.message)
    } finally {
      setUploading(prev => ({ ...prev, [criterionId]: false }))
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Preparar inputs con documentación y usar el motor de scoring correcto
      const scoringInputs = criteria.map(c => {
        let score = 0;
        
        if (c.response_type === 'boolean') {
          // Convertir yes/no a score
          if (responses[c.id] === 'yes') score = 100;
          else if (responses[c.id] === 'no') score = 0;
        } else {
          // Para text, asumimos que si respondió es 100, si no 0
          score = responses[c.id] ? 100 : 0;
        }

        return {
          criterion_id: c.id.toString(),
          score,
          response: responses[c.id],
          has_documentation: !!attachments[c.id]
        };
      });

      // Importar calculator con lógica de knockout
      const { calculateWeightedScore } = await import('@/lib/scoring/calculator');
      
      // Calcular con nueva lógica que respeta knockouts
      const result = calculateWeightedScore(scoringInputs, criteria);
      
      // Guardar en evaluations con todos los campos necesarios
      const { error: evalErr } = await supabase
        .from('evaluations')
        .insert({
          center_id: submission.center_id,
          total_score: result.totalScore,
          status: 'completed',
          score_level: result.status,
          knockout_failed: result.knockoutFailed,
          knockout_reason: result.knockoutReason,
          missing_docs_penalty: result.missingDocsPenalty,
          responses: {
            scores: responses,
            attachments: attachments,
            breakdown: result.weightedScores
          },
          evaluator_email: submission.client_email,
          token: token
        })

      if (evalErr) throw evalErr

      // Actualizar estado de submission
      await supabase
        .from('client_submissions')
        .update({ submission_status: 'completed' })
        .eq('id', submission.id)

      setSubmission({ ...submission, submission_status: 'completed' })
    } catch (err: any) {
      alert("Submission error: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Loading evaluation...</p>
    </div>
  )

  if (error) return (
    <div className="max-w-md mx-auto mt-20 card p-8 text-center border-red-100 bg-red-50/30">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-900 mb-2">Access Error</h2>
      <p className="text-slate-600 mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary w-full">Try Again</button>
    </div>
  )

  if (submission?.submission_status === 'completed') return (
    <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900">Thank You!</h1>
      <p className="text-xl text-slate-600">Your site evaluation has been submitted successfully. Our team will review the information and contact you shortly.</p>
      <div className="pt-8">
        <button onClick={() => window.close()} className="btn-secondary">Close Window</button>
      </div>
    </div>
  )

  if (!disclaimerAccepted) return (
    <div className="max-w-3xl mx-auto mt-10 animate-fade-in">
      <div className="card overflow-hidden border-t-4 border-t-primary-600">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-primary-600">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Terms & Conditions</h1>
          </div>
          
          <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100 max-h-[400px] overflow-y-auto text-sm leading-relaxed">
            <p className="font-bold mb-4">Site Evaluation Platform Disclaimer</p>
            <p>By proceeding with this evaluation, you agree that all information provided is accurate and representative of your site's current capabilities.</p>
            <p>1. <strong>Confidentiality:</strong> All data submitted will be handled according to our privacy policy and used solely for site selection purposes.</p>
            <p>2. <strong>Documentation:</strong> Uploaded files must be authentic and valid at the time of submission.</p>
            <p>3. <strong>Accuracy:</strong> Providing false information may result in immediate disqualification from the selection process.</p>
            <p>4. <strong>Critical Requirements:</strong> Questions marked as "Required" are knockout criteria. Failing these will result in automatic disqualification regardless of other scores.</p>
            <p className="mt-4">Please review the full terms before accepting to start the questionnaire.</p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button onClick={handleAcceptDisclaimer} className="btn-primary flex-1 py-4 text-lg">
              I Accept & Start Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 animate-fade-in">
      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest">
          <FileText className="w-4 h-4" />
          Site Scoring Evaluation
        </div>
        <h1 className="text-4xl font-black text-slate-900">{submission?.centers?.name || 'Site Evaluation'}</h1>
        <p className="text-slate-500 text-lg">Please answer all questions accurately. You can upload supporting documents where required.</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Questions marked as "Required" are critical. Failing these will result in automatic disqualification.
          </p>
        </div>
      </header>

      {/* Questionnaire */}
      <div className="space-y-12">
        {criteria.map((c, idx) => (
          <div key={c.id} className="space-y-6 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                {idx + 1}
              </div>
              
              <div className="flex-1 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {c.name}
                  {c.is_knockout && <span className="ml-3 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required</span>}
                </h3>

                {/* Response Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {c.response_type === 'boolean' ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setResponses(prev => ({ ...prev, [c.id]: 'yes' }))}
                        className={`flex-1 py-3 px-6 rounded-xl border-2 font-bold transition-all ${
                          responses[c.id] === 'yes' 
                            ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        YES
                      </button>
                      <button 
                        onClick={() => setResponses(prev => ({ ...prev, [c.id]: 'no' }))}
                        className={`flex-1 py-3 px-6 rounded-xl border-2 font-bold transition-all ${
                          responses[c.id] === 'no' 
                            ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <textarea 
                        placeholder="Please provide a detailed answer here..."
                        className="input min-h-[120px] bg-slate-50 focus:bg-white transition-colors text-slate-700"
                        value={responses[c.id] || ''}
                        onChange={(e) => setResponses(prev => ({ ...prev, [c.id]: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Upload Field */}
                  <div className="sm:col-span-2">
                    {attachments[c.id] ? (
                      <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <FileText className="w-5 h-5 text-primary-600" />
                          </div>
                          <span className="text-sm font-bold text-primary-700">Document Uploaded</span>
                        </div>
                        <button 
                          onClick={() => setAttachments(prev => {
                            const n =
