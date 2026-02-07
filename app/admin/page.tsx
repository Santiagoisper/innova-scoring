"use client"

import { useEffect, useState, useCallback } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  Globe,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  MapPin,
  Calculator,
  Sigma
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

/* =========================
   Types
========================= */

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
  total_score: number | null
  status: string
  score_level: string | null
  created_at: string
}

/* =========================
   Colors (Innova Trials / Novo Nordisk Style)
========================= */

const COLORS = {
  primary: "#004a99", // Deep Blue
  success: "#10b981", // Green
  warning: "#f59e0b", // Amber
  danger: "#ef4444",  // Red
  neutral: "#94a3b8", // Slate
  accent: "#6366f1",  // Indigo
}

export default function AdminDashboard() {
  const supabase = supabaseBrowser()

  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [centersRes, evalsRes] = await Promise.all([
      supabase.from("centers").select("*"),
      supabase
        .from("evaluations")
        .select("id, center_id, total_score, status, score_level, created_at")
        .order("created_at", { ascending: false }),
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Determine score level if not set in DB
  const getLevel = (score: number | null) => {
    if (score === null) return null
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  // Filter evaluations that are actually finished
  const finishedEvals = evaluations.filter((e) => 
    e.status === "completed" || e.status === "submitted" || (e.total_score !== null && e.total_score > 0)
  )

  // Metrics Calculation
  const totalSites = centers.length
  
  const approvedCount = finishedEvals.filter(e => 
    e.score_level === 'green' || (e.score_level === null && getLevel(e.total_score) === 'green')
  ).length

  const conditionalCount = finishedEvals.filter(e => 
    e.score_level === 'yellow' || (e.score_level === null && getLevel(e.total_score) === 'yellow')
  ).length

  const notApprovedCount = finishedEvals.filter(e => 
    e.score_level === 'red' || (e.score_level === null && getLevel(e.total_score) === 'red')
  ).length

  const approvedRate = finishedEvals.length > 0 
    ? Math.round((approvedCount / finishedEvals.length) * 100) 
    : 0

  const avgScore = finishedEvals.length > 0
    ? Math.round(finishedEvals.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / finishedEvals.length)
    : 0

  const pendingActions = evaluations.filter(e => e.status === 'pending' || !e.status).length

  // Advanced Statistics
  const allScores = finishedEvals.map(e => e.total_score || 0).sort((a, b) => a - b)

  const medianScore = allScores.length > 0
    ? allScores.length % 2 === 0
      ? Math.round((allScores[allScores.length / 2 - 1] + allScores[allScores.length / 2]) / 2)
      : allScores[Math.floor(allScores.length / 2)]
    : 0

  const stdDeviation = allScores.length > 1
    ? Math.round(Math.sqrt(allScores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / allScores.length) * 10) / 10
    : 0

  const p25 = allScores.length > 0
    ? allScores[Math.floor(allScores.length * 0.25)]
    : 0

  const p75 = allScores.length > 0
    ? allScores[Math.floor(allScores.length * 0.75)]
    : 0

  const maxScore = allScores.length > 0 ? allScores[allScores.length - 1] : 0
  const minScore = allScores.length > 0 ? allScores[0] : 0
  const scoreRange = maxScore - minScore

  // Geographic Distribution
  const countryDistMap = centers.reduce((acc: any, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1
    return acc
  }, {})
  
  const countryDist = Object.entries(countryDistMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5)

  // Status Distribution (Matches the counts exactly)
  const statusDist = [
    { name: "Approved", value: approvedCount, color: COLORS.success },
    { name: "Conditional", value: conditionalCount, color: COLORS.warning },
    { name: "Not Approved", value: notApprovedCount, color: COLORS.danger },
    { name: "Pending", value: pendingActions, color: COLORS.neutral },
  ].filter(d => d.value > 0)

  if (loading && centers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-20 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Innova Trials Intelligence</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Global Site Evaluation & Selection Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest border border-green-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            System Live
          </div>
          <button onClick={loadData} disabled={loading} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm disabled:opacity-50" title="Actualizar datos">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Strategic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Global Sites", value: totalSites, icon: Globe, color: "bg-blue-50 text-blue-600", sub: "Total network" },
          { label: "Approval Rate", value: `${approvedRate}%`, icon: TrendingUp, color: "bg-green-50 text-green-600", sub: "Of completed evals" },
          { label: "Avg. Quality Score", value: avgScore, icon: Activity, color: "bg-indigo-50 text-indigo-600", sub: "Out of 100" },
          { label: "Pending Tasks", value: pendingActions, icon: Clock, color: "bg-amber-50 text-amber-600", sub: "Awaiting client" },
        ].map((stat, i) => (
          <div key={i} className="card p-8 flex flex-col justify-between border-none shadow-xl shadow-slate-200/50 hover:translate-y-[-4px] transition-all duration-300">
            <div className={`p-4 rounded-2xl w-fit ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 mt-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1 italic">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Score Analytics */}
      <div className="card p-8 border-none shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-violet-50 text-violet-600">
            <Sigma className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Score Analytics</h3>
            <p className="text-xs text-slate-500">Statistical distribution of completed evaluations</p>
          </div>
        </div>

        {allScores.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Median", value: medianScore, sub: "Middle value" },
              { label: "Std Dev", value: stdDeviation, sub: "Dispersion" },
              { label: "P25", value: p25, sub: "25th percentile" },
              { label: "P75", value: p75, sub: "75th percentile" },
              { label: "Range", value: scoreRange, sub: `${minScore} — ${maxScore}` },
              { label: "Sample", value: allScores.length, sub: "Evaluations" },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-50">
                <p className="text-2xl font-black text-slate-900">{item.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{item.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No scored evaluations yet to compute statistics.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quality Status Distribution */}
        <div className="lg:col-span-1 card p-8 border-none shadow-xl shadow-slate-200/50 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary-600" />
              Quality Status
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Footprint */}
        <div className="lg:col-span-2 card p-8 border-none shadow-xl shadow-slate-200/50 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              Global Footprint
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 5 Countries</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryDist} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#1e293b', fontSize: 10, fontWeight: 900}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 8, 8, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Alert */}
      <div className="card p-6 bg-slate-900 text-white border-none shadow-2xl shadow-slate-400/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="font-black text-lg">System Audit Ready</h4>
            <p className="text-slate-400 text-sm font-medium">All evaluation data is synchronized with Supabase Global Cloud.</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/centers'}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-50 transition-all shadow-xl shadow-white/10"
        >
          Manage Sites Now
        </button>
      </div>
    </div>
  )
}
