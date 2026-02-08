"use client"

import { useEffect, useState, useCallback } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { calculateStatus, getStarRating } from "@/lib/scoring/calculator"
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
  Star
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

type CriterionRow = {
  id: string
  weight: number
}

type EvalItemRow = {
  evaluation_id: string
  criterion_id: string
  score: number
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
  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [allCriteria, setAllCriteria] = useState<CriterionRow[]>([])
  const [allEvalItems, setAllEvalItems] = useState<EvalItemRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = supabaseBrowser()
    const [centersRes, evalsRes, criteriaRes, evalItemsRes] = await Promise.all([
      supabase.from("centers").select("*"),
      supabase
        .from("evaluations")
        .select("id, center_id, total_score, status, score_level, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("criteria").select("id, weight"),
      supabase.from("evaluation_items").select("evaluation_id, criterion_id, score"),
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    if (criteriaRes.data) setAllCriteria(criteriaRes.data)
    if (evalItemsRes.data) setAllEvalItems(evalItemsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Recalculate score for an evaluation using ALL criteria weights
  function recalcScore(evalId: string): number {
    const totalWeight = allCriteria.reduce((sum, c) => sum + (c.weight || 0), 0)
    if (totalWeight === 0) return 0

    const items = allEvalItems.filter(it => it.evaluation_id === evalId)
    const criteriaMap = new Map(allCriteria.map(c => [c.id, c.weight || 0]))

    let weightedSum = 0
    for (const item of items) {
      const w = criteriaMap.get(item.criterion_id) || 0
      weightedSum += item.score * w
    }

    return Math.round((weightedSum / totalWeight) * 100) / 100
  }

  // Build recalculated evaluations
  const recalcEvals = evaluations.map(e => {
    const isFinished = e.status === 'completed' || e.status === 'submitted'
    // For finished evaluations with eval_items, recalculate
    const hasItems = allEvalItems.some(it => it.evaluation_id === e.id)
    const score = isFinished && hasItems ? recalcScore(e.id) : (isFinished ? (e.total_score || 0) : 0)
    const level = isFinished ? calculateStatus(score) : null
    return { ...e, calcScore: score, calcLevel: level }
  })

  // Filter evaluations that are actually finished
  const finishedEvals = recalcEvals.filter(e =>
    e.status === "completed" || e.status === "submitted"
  )

  // Metrics Calculation
  const totalSites = centers.length

  const approvedCount = finishedEvals.filter(e => e.calcLevel === 'green').length
  const conditionalCount = finishedEvals.filter(e => e.calcLevel === 'yellow').length
  const notApprovedCount = finishedEvals.filter(e => e.calcLevel === 'red').length

  const avgScore = finishedEvals.length > 0
    ? Math.round(finishedEvals.reduce((acc, curr) => acc + curr.calcScore, 0) / finishedEvals.length)
    : 0

  const pendingActions = evaluations.filter(e => e.status === 'pending' || !e.status).length

  // Star Ranking System (new tiers)
  const centerMap = new Map(centers.map(c => [c.id, c.name]))

  type RankedSite = { name: string; score: number }

  const starTiers: { stars: number; label: string; min: number; max: number; sites: RankedSite[] }[] = [
    { stars: 5, label: "Excellence", min: 80, max: 100, sites: [] },
    { stars: 4, label: "High Performance", min: 60, max: 79, sites: [] },
    { stars: 3, label: "Developing", min: 40, max: 59, sites: [] },
    { stars: 2, label: "Needs Improvement", min: 20, max: 39, sites: [] },
    { stars: 1, label: "Critical", min: 0, max: 19, sites: [] },
  ]

  for (const ev of finishedEvals) {
    const score = ev.calcScore
    const name = centerMap.get(ev.center_id) || 'Unknown'
    const tier = starTiers.find(t => score >= t.min && score <= t.max)
    if (tier) {
      tier.sites.push({ name, score })
    }
  }

  // Sort each tier by score descending
  for (const tier of starTiers) {
    tier.sites.sort((a, b) => b.score - a.score)
  }

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
          { label: "Global Sites", value: totalSites, icon: Globe, color: "bg-blue-50 text-blue-600", sub: "Total registered sites" },
          { label: "Approved Sites", value: approvedCount, icon: TrendingUp, color: "bg-green-50 text-green-600", sub: "Green status" },
          { label: "Avg. Quality Score", value: `${avgScore}%`, icon: Activity, color: "bg-indigo-50 text-indigo-600", sub: "Overall average" },
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

      {/* Star Ranking */}
      <div className="card p-8 border-none shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Site Ranking</h3>
            <p className="text-xs text-slate-500">Classification by performance tier</p>
          </div>
        </div>

        {finishedEvals.length > 0 ? (
          <div className="space-y-5">
            {starTiers.map((tier) => (
              <div key={tier.stars} className="flex items-start gap-4">
                {/* Stars */}
                <div className="flex items-center gap-0.5 pt-1 w-28 flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < tier.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Tier info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{tier.label}</span>
                    <span className="text-[10px] text-slate-400">({tier.min}–{tier.max})</span>
                  </div>

                  {tier.sites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tier.sites.slice(0, 5).map((site, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-100"
                        >
                          {site.name}
                          <span className="text-slate-400 font-bold">{site.score}</span>
                        </span>
                      ))}
                      {tier.sites.length > 5 && (
                        <span className="text-xs text-slate-400 self-center">+{tier.sites.length - 5} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-300 font-bold">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No evaluated sites yet.
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
