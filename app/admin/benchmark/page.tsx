"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  GitCompare, 
  RefreshCw,
  Trophy,
  Target,
  TrendingUp
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

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

const BENCHMARK_LEVELS = [
  { label: 'Excellent', minScore: 90, color: '#10b981' },
  { label: 'Good', minScore: 80, color: '#3b82f6' },
  { label: 'Acceptable', minScore: 70, color: '#f59e0b' },
  { label: 'Needs Improvement', minScore: 60, color: '#f97316' },
  { label: 'Critical', minScore: 0, color: '#ef4444' },
]

function getBenchmarkLevel(score: number) {
  return BENCHMARK_LEVELS.find(b => score >= b.minScore) || BENCHMARK_LEVELS[BENCHMARK_LEVELS.length - 1]
}

export default function BenchmarkPage() {
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

  // Get latest evaluation per center
  const latestEvaluations = centers.map(center => {
    const eval_ = evaluations.find(e => e.center_id === center.id)
    return { center, evaluation: eval_ }
  }).filter(c => c.evaluation)

  // Calculate stats
  const scores = latestEvaluations.map(c => c.evaluation!.total_score)
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const minScore = scores.length > 0 ? Math.min(...scores) : 0
  const sortedScores = [...scores].sort((a, b) => a - b)
  const medianScore = scores.length > 0 
    ? sortedScores[Math.floor(scores.length / 2)] 
    : 0

  // Chart data - sorted by score descending
  const chartData = latestEvaluations
    .sort((a, b) => b.evaluation!.total_score - a.evaluation!.total_score)
    .map(({ center, evaluation }) => ({
      name: center.name.length > 15 ? center.name.slice(0, 15) + '...' : center.name,
      score: evaluation!.total_score,
      fill: getBenchmarkLevel(evaluation!.total_score).color
    }))

  // Count by benchmark level
  const benchmarkCounts = BENCHMARK_LEVELS.map(level => ({
    ...level,
    count: latestEvaluations.filter(({ evaluation }) => {
      const bl = getBenchmarkLevel(evaluation!.total_score)
      return bl.label === level.label
    }).length
  }))

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
        <h1 className="text-2xl font-bold text-slate-900 font-display">Benchmark</h1>
        <p className="text-slate-600 mt-1">Compare center performance against industry standards</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Average</p>
              <p className="text-3xl font-bold text-slate-900">{avgScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Median</p>
              <p className="text-3xl font-bold text-slate-900">{medianScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Maximum</p>
              <p className="text-3xl font-bold text-accent-600">{maxScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Minimum</p>
              <p className="text-3xl font-bold text-red-600">{minScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Scale */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Benchmark Scale</h3>
        <div className="flex rounded-lg overflow-hidden h-8">
          {BENCHMARK_LEVELS.map((level, i) => (
            <div 
              key={level.label}
              className="flex-1 relative group"
              style={{ backgroundColor: level.color }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap transition-opacity z-10">
                {level.label} ({level.minScore}+)
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {BENCHMARK_LEVELS.map((level) => (
            <span key={level.label} className="text-xs text-slate-500">{level.minScore}</span>
          ))}
          <span className="text-xs text-slate-500">100</span>
        </div>
      </div>

      {/* Distribution by Level */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribution by Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {benchmarkCounts.map((level) => (
            <div key={level.label} className="text-center p-4 rounded-xl bg-slate-50">
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-2"
                style={{ backgroundColor: level.color }}
              ></div>
              <p className="text-2xl font-bold text-slate-900">{level.count}</p>
              <p className="text-sm text-slate-600">{level.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Center Ranking</h3>
        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No evaluations to compare</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0' 
                  }}
                  formatter={(value: number) => [`Score: ${value}`, '']}
                />
                <ReferenceLine x={avgScore} stroke="#6366f1" strokeDasharray="5 5" label={{ value: 'Avg', position: 'top' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Ranking Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Detailed Ranking</h3>
        </div>
        {latestEvaluations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No evaluations available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="table-header py-4 px-6">Rank</th>
                  <th className="table-header py-4 px-4">Center</th>
                  <th className="table-header py-4 px-4">Score</th>
                  <th className="table-header py-4 px-4">Percentile</th>
                  <th className="table-header py-4 px-4">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestEvaluations
                  .sort((a, b) => b.evaluation!.total_score - a.evaluation!.total_score)
                  .map(({ center, evaluation }, index) => {
                    const level = getBenchmarkLevel(evaluation!.total_score)
                    const percentile = Math.round(((latestEvaluations.length - index) / latestEvaluations.length) * 100)
                    
                    return (
                      <tr key={center.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell px-6">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                            {index + 1}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div>
                            <p className="font-medium text-slate-900">{center.name}</p>
                            <p className="text-xs text-slate-500">{center.city}, {center.country}</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-xl font-bold">{evaluation!.total_score}</span>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-slate-600">Top {percentile}%</span>
                        </td>
                        <td className="table-cell">
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: level.color }}
                          >
                            {level.label}
                          </span>
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
