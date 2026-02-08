"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  Scale, 
  Edit2, 
  Save, 
  X, 
  RefreshCw,
  Info
} from "lucide-react"

type Criterion = {
  id: string
  name: string
  description: string
  weight: number
  category: string
  order: number
}

export default function CriteriaPage() {
  const supabase = supabaseBrowser()
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState(0)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const { data } = await supabase
      .from('criteria')
      .select('*')
      .order('order', { ascending: true })
    
    if (data) setCriteria(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Group by category
  const categories = criteria.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, Criterion[]>)

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)

  async function handleSaveWeight(id: string) {
    setSaving(true)
    const { error } = await supabase
      .from('criteria')
      .update({ weight: editWeight })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      loadData()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Evaluation Criteria</h1>
          <p className="text-slate-600 mt-1">Scoring criteria and weight configuration</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Scale className="w-4 h-4" />
          Total Weight: <span className="font-bold">{totalWeight}</span>
        </div>
      </div>

      {/* Scoring Scale */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Scoring Scale</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-accent-50 border border-accent-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-accent-500"></span>
              <span className="font-semibold text-accent-800">Approved</span>
            </div>
            <p className="text-2xl font-bold text-accent-700">80 - 100</p>
            <p className="text-sm text-accent-600 mt-1">
              Center meets criteria satisfactorily
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-amber-800">Conditional</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">60 - 79</p>
            <p className="text-sm text-amber-600 mt-1">
              Partial compliance, improvements needed
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="font-semibold text-red-800">Not Approved</span>
            </div>
            <p className="text-2xl font-bold text-red-700">0 - 59</p>
            <p className="text-sm text-red-600 mt-1">
              Center does not meet the criterion
            </p>
          </div>
        </div>
      </div>

      {/* Criteria by Category */}
      {Object.entries(categories).map(([category, categoryCriteria]) => (
        <div key={category} className="card overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">{category}</h3>
            <p className="text-sm text-slate-500">
              {categoryCriteria.length} criteria · Combined weight: {categoryCriteria.reduce((sum, c) => sum + c.weight, 0)}
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {categoryCriteria.map((criterion) => (
              <div key={criterion.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{criterion.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{criterion.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingId === criterion.id ? (
                      <>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-16 input text-center"
                        />
                        <button
                          onClick={() => handleSaveWeight(criterion.id)}
                          disabled={saving}
                          className="btn-primary btn-sm"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary btn-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-semibold">
                          Weight: {criterion.weight}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(criterion.id)
                            setEditWeight(criterion.weight)
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div className="card p-6 bg-primary-50 border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-900">About Weights</h4>
            <p className="text-sm text-primary-700 mt-1">
              Weights determine the relative importance of each criterion in the final score calculation. 
              Higher weights (1-5) mean the criterion has more impact on the total score. 
              The weighted average is calculated as: Σ(score × weight) / Σ(weight).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
