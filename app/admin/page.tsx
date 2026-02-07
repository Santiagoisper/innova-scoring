"use client"

import { useEffect, useState } from "react"
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
  MapPin
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

  async function loadData() {
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
  }

  useEffect(() => {
    loadData()
  }, [])

  // In the current database, 'submitted' or 'completed' are used for finished evaluations
  const completedEvals = evaluations.filter((e) => 
    e.status === "completed" || e.status === "submitted" || (e.total_score !== null && e.total_score > 0)
  )

  // Determine score level if not set in DB
  const getLevel = (score: number | null) => {
    if (score === null) return null
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  // Metrics
  const stats = {
    totalSites: centers.length,
    activeEvaluations: evaluations.length,
    approvedRate: completedEvals.length > 0 
      ? Math.round((completedEvals.filter(e => (e.score_level === 'green' || getLevel(e.total_score) === 'green')).length / completedEvals.length) * 100) 
      : 0,
    pendingActions: evaluations.filter(e => e.status === 'pending' || !e.status).length,
    avgScore: completedEvals.length > 0
      ? Math.round(completedEvals.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / completedEvals.length)
      : 0
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

  // Status Distribution
  const statusDist = [
    { name: "Approved", value: completedEvals.filter((e) => e.score_level === "green" || getLevel(e.total_score) === 'green').length, color: COLORS.success },
    { name: "Conditional", value: completedEvals.filter((e) => e.score_level === "yellow" || getLevel(e.total_score) === 'yellow').length, color: COLORS.warning },
    { name: "Not Approved", value: completedEvals.filter((e) => e.score_level === "red" || getLevel(e.total_score) === 'red').length, color: COLORS.danger },
    { name: "Pending", value: stats.pendingActions, color: COLORS.neutral },
  ].filter(d => d.value > 0)

  if (loading) {
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
          <button onClick={loadData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Strategic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Global Sites", value: stats.totalSites, icon: Globe, color: "bg-blue-50 text-blue-600", sub: "Total network" },
          { label: "Approval Rate", value: `${stats.approvedRate}%`, icon: TrendingUp, color: "bg-green-50 text-green-600", sub: "Of completed evals" },
          { label: "Avg. Quality Score", value: stats.avgScore, icon: Activity, color: "bg-indigo-50 text-indigo-600", sub: "Out of 100" },
          { label: "Pending Tasks", value: stats.pendingActions, icon: Clock, color: "bg-amber-50 text-amber-600", sub: "Awaiting client" },
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
