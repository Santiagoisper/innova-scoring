"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { Award, RefreshCw, ChevronRight } from "lucide-react"

type Center = {
  id: string
  name: string
  code: string
  country: string
  city: string
}

type Evaluation = {
  id: string
  center_id: string
  total_score: number
  status: 'green' | 'yellow' | 'red'
  created_at: string
}

type MaturityLevel = 'initial' | 'developing' | 'defined' | 'managed' | 'optimized'

const MATURITY_LEVELS: Record<MaturityLevel, {
  level: number
  label: string
  description: string
  minScore: number
  bgColor: string
  textColor: string
  borderColor: string
  dotColor: string
}> = {
  optimized: {
    level: 5,
    label: 'Optimized',
    description: 'Continuous improvement. Operational excellence.',
    minScore: 90,
    bgColor: 'bg-accent-50',
    textColor: 'text-accent-800',
    borderColor: 'border-accent-200',
    dotColor: 'bg-accent-500',
  },
  managed: {
    level: 4,
    label: 'Managed',
    description: 'Processes measured and controlled.',
    minScore: 80,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  defined: {
    level: 3,
    label: 'Defined',
    description: 'Documented and standardized processes.',
    minScore: 70,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  developing: {
    level: 2,
    label: 'Developing',
    description: 'Basic processes established. Improvements in progress.',
    minScore: 50,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  initial: {
    level: 1,
    label: 'Initial',
    description: 'Ad-hoc, reactive processes. No standardization.',
    minScore: 0,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
  },
}

function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 90) return 'optimized'
  if (score >= 80) return 'managed'
  if (score >= 70) return 'defined'
  if (score >= 50) return 'developing'
  return 'initial'
}

export default function MaturityPage() {
  const supabase = supabaseBrowser()
  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    
    const [centersRes, evalsRes] = await Promise.all([
      supabase.from('centers').select('*'),
      supabase.from('evaluations').select('*').order('created_at', { ascending: false })
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function getLatestEvaluation(centerId: string): Evaluation | undefined {
    return evaluations.find(e => e.center_id === centerId)
  }

  const centersWithMaturity = centers.map(center => {
    const latestEval = getLatestEvaluation(center.id)
    const maturity = latestEval ? getMaturityLevel(latestEval.total_score) : null
    return { center, evaluation: latestEval, maturity }
  }).filter(c => c.maturity !== null)

  // Count by maturity level
  const maturityCounts: Record<MaturityLevel, number> = {
    optimized: centersWithMaturity.filter(c => c.maturity === 'optimized').length,
    managed: centersWithMaturity.filter(c => c.maturity === 'managed').length,
    defined: centersWithMaturity.filter(c => c.maturity === 'defined').length,
    developing: centersWithMaturity.filter(c => c.maturity === 'developing').length,
    initial: centersWithMaturity.filter(c => c.maturity === 'initial').length,
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Maturity Model</h1>
        <p className="text-slate-600 mt-1">Classify centers by operational maturity level</p>
      </div>

      {/* Maturity Model Visual */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Maturity Scale</h3>
        <div className="space-y-3">
          {(['optimized', 'managed', 'defined', 'developing', 'initial'] as MaturityLevel[]).map((level) => {
            const info = MATURITY_LEVELS[level]
            const count = maturityCounts[level]
            
            return (
              <div 
                key={level}
                className={`p-4 rounded-xl ${info.bgColor} border ${info.borderColor} flex items-center justify-between transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${info.dotColor} flex items-center justify-center`}>
                    <span className="text-white font-bold">{info.level}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${info.textColor}`}>{info.label}</p>
                    <p className="text-sm text-slate-600">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">Score: {info.minScore}+</span>
                  <span className={`text-2xl font-bold ${info.textColor}`}>{count}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Centers by Maturity */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Centers by Maturity Level</h3>
        </div>

        {centersWithMaturity.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No maturity data</h3>
            <p className="text-slate-500">Complete evaluations to see maturity classifications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="table-header py-4 px-6">Center</th>
                  <th className="table-header py-4 px-4">Location</th>
                  <th className="table-header py-4 px-4">Score</th>
                  <th className="table-header py-4 px-4">Maturity Level</th>
                  <th className="table-header py-4 px-4">Last Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {centersWithMaturity
                  .sort((a, b) => (b.evaluation?.total_score || 0) - (a.evaluation?.total_score || 0))
                  .map(({ center, evaluation, maturity }) => {
                    const info = MATURITY_LEVELS[maturity!]
                    return (
                      <tr key={center.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell px-6">
                          <div>
                            <p className="font-medium text-slate-900">{center.name}</p>
                            <p className="text-xs text-slate-500">{center.code}</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          {center.city}, {center.country}
                        </td>
                        <td className="table-cell">
                          <span className="text-xl font-bold">{evaluation?.total_score}</span>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${info.bgColor} ${info.textColor} font-medium text-sm`}>
                            <span className={`w-2 h-2 rounded-full ${info.dotColor}`}></span>
                            Level {info.level}: {info.label}
                          </span>
                        </td>
                        <td className="table-cell text-slate-500 text-sm">
                          {evaluation && new Date(evaluation.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
