"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Calendar
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type Center = {
  id: string
  name: string
  code: string
}

type Evaluation = {
  id: string
  center_id: string
  total_score: number
  status: 'green' | 'yellow' | 'red'
  created_at: string
}

export default function DynamicsPage() {
  const supabase = supabaseBrowser()
  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    
    const [centersRes, evalsRes] = await Promise.all([
      supabase.from('centers').select('id, name, code'),
      supabase.from('evaluations').select('*').order('created_at', { ascending: true })
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function getEvaluationsByCenter(centerId: string): Evaluation[] {
    return evaluations.filter(e => e.center_id === centerId)
  }

  function calculateTrend(centerEvals: Evaluation[]): { trend: string; icon: any; color: string } {
    if (centerEvals.length < 2) return { trend: 'No data', icon: Minus, color: 'text-slate-500' }
    
    const first = centerEvals[0].total_score
    const last = centerEvals[centerEvals.length - 1].total_score
    const diff = last - first

    if (diff > 5) return { trend: 'Improving', icon: TrendingUp, color: 'text-accent-600' }
    if (diff < -5) return { trend: 'Declining', icon: TrendingDown, color: 'text-red-600' }
    return { trend: 'Stable', icon: Minus, color: 'text-slate-500' }
  }

  const centersWithEvaluations = centers.filter(c => 
    evaluations.some(e => e.center_id === c.id)
  )

  // Summary stats
  const trendSummary = {
    improving: centersWithEvaluations.filter(c => 
      calculateTrend(getEvaluationsByCenter(c.id)).trend === 'Improving'
    ).length,
    stable: centersWithEvaluations.filter(c => 
      calculateTrend(getEvaluationsByCenter(c.id)).trend === 'Stable'
    ).length,
    declining: centersWithEvaluations.filter(c => 
      calculateTrend(getEvaluationsByCenter(c.id)).trend === 'Declining'
    ).length,
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
        <h1 className="text-2xl font-bold text-slate-900 font-display">Evaluation Dynamics</h1>
        <p className="text-slate-600 mt-1">Track how center scores change over time</p>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Improving</p>
              <p className="text-3xl font-bold text-accent-600">{trendSummary.improving}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Stable</p>
              <p className="text-3xl font-bold text-slate-600">{trendSummary.stable}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Minus className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Declining</p>
              <p className="text-3xl font-bold text-red-600">{trendSummary.declining}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Centers Timeline */}
      {centersWithEvaluations.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No evaluation history</h3>
          <p className="text-slate-500">
            Complete evaluations to see trends over time
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {centersWithEvaluations.map((center) => {
            const centerEvals = getEvaluationsByCenter(center.id)
            const { trend, icon: TrendIcon, color } = calculateTrend(centerEvals)

            const chartData = centerEvals.map(e => ({
              date: new Date(e.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              score: e.total_score
            }))

            return (
              <div key={center.id} className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{center.name}</h3>
                      <p className="text-sm text-slate-500">{center.code}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      trend === 'Improving' ? 'bg-accent-50' :
                      trend === 'Declining' ? 'bg-red-50' : 'bg-slate-50'
                    }`}>
                      <TrendIcon className={`w-4 h-4 ${color}`} />
                      <span className={`text-sm font-medium ${color}`}>{trend}</span>
                    </div>
                  </div>
                </div>

                {centerEvals.length > 1 ? (
                  <div className="p-6">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid #e2e8f0' 
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            dot={{ fill: '#6366f1', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Score: {centerEvals[0].total_score}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(centerEvals[0].created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 italic">
                      Need at least 2 evaluations to show trend chart
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
