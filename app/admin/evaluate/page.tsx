"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import { calculateWeightedScore } from "@/lib/scoring/calculator"
import { Criterion, Center } from "@/types"
import { 
  ClipboardCheck, 
  Building2,
  ChevronRight,
  Check,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react"

export default function EvaluatePage() {
  const searchParams = useSearchParams()
  const preselectedCenter = searchParams.get('center')
  const supabase = supabaseBrowser()

  const [centers, setCenters] = useState<Center[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [selectedCenter, setSelectedCenter] = useState(preselectedCenter || '')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [generalNotes, setGeneralNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)

    const [centersRes, criteriaRes] = await Promise.all([
      supabase.from('centers').select('*'),
      supabase.from('criteria').select('*').order('order', { ascending: true })
    ])

    if (centersRes.data) setCenters(centersRes.data as Center[])
    if (criteriaRes.data) setCriteria(criteriaRes.data as Criterion[])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Group criteria by category
  const categories = criteria.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, Criterion[]>)

  function handleScoreChange(criterionId: string, value: number) {
    setScores(prev => ({ ...prev, [criterionId]: value }))
  }

  function handleNoteChange(criterionId: string, value: string) {
    setNotes(prev => ({ ...prev, [criterionId]: value }))
  }

  // Calculate current total score using centralized logic
  function getCurrentScoringResult() {
    const scoringInput = Object.entries(scores).map(([id, score]) => ({
      criterion_id: id,
      score
    }))
    return calculateWeightedScore(scoringInput, criteria)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!selectedCenter) {
      setError('Please select a center')
      return
    }

    const scoredItemsCount = Object.keys(scores).length
    if (scoredItemsCount === 0) {
      setError('Please score at least one criterion')
      return
    }

    setSaving(true)

    try {
      const { totalScore, status } = getCurrentScoringResult()

      // Insert evaluation
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          center_id: selectedCenter,
          total_score: totalScore,
          status: 'completed', // Admin evaluations are completed by default
          score_level: status,
          notes: generalNotes
        }])
        .select()
        .single()

      if (evalError) throw evalError

      // Insert evaluation items
      const items = Object.entries(scores).map(([criterion_id, score]) => ({
        evaluation_id: evaluation.id,
        criterion_id,
        score,
        notes: notes[criterion_id] || ''
      }))

      const { error: itemsError } = await supabase
        .from('evaluation_items')
        .insert(items)

      if (itemsError) throw itemsError

      setSuccess(true)
      setScores({})
      setNotes({})
      setGeneralNotes('')
      setSelectedCenter('')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Error saving evaluation')
    }

    setSaving(false)
  }

  const { totalScore: currentScore, status: currentStatus } = getCurrentScoringResult()
  const progress = criteria.length > 0 ? (Object.keys(scores).length / criteria.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Evaluate Center</h1>
        <p className="text-slate-600 mt-1">Score a research center across all criteria</p>
      </div>

      {/* Progress Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">Evaluation Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {Object.keys(scores).length} / {criteria.length} criteria
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Current Score</p>
            <p className={`text-3xl font-bold ${
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
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Center Selection */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            <Building2 className="w-4 h-4 inline mr-2" />
            Select Center
          </label>
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="input"
          >
            <option value="">-- Select a center --</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name} ({center.code})
              </option>
            ))}
          </select>
        </div>

        {/* Criteria by Category */}
        {Object.entries(categories).map(([category, categoryCriteria]) => (
          <div key={category} className="card overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">{category}</h3>
              <p className="text-sm text-slate-500">
                {categoryCriteria.length} criteria in this category
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {categoryCriteria.map((criterion) => (
                <div key={criterion.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900">{criterion.name}</h4>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">Weight: {criterion.weight}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{criterion.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[criterion.id] ?? ''}
                        onChange={(e) => handleScoreChange(criterion.id, Number(e.target.value))}
                        className="w-20 input text-center font-bold"
                        placeholder="0-100"
                      />
                      {scores[criterion.id] !== undefined && (
                        <Check className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={notes[criterion.id] || ''}
                    onChange={(e) => handleNoteChange(criterion.id, e.target.value)}
                    className="input text-sm"
                    placeholder="Add notes (optional)..."
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* General Notes */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            General Notes
          </label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="input"
            rows={4}
            placeholder="Additional observations about this evaluation..."
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p>Evaluation saved successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary btn-lg"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Evaluation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
