"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
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
  status: "pending" | "completed"
  score_level: "green" | "yellow" | "red" | null
  created_at: string
}

/* =========================
   Colors (Novo Nordisk Style)
========================= */

const COLORS = {
  primary: "#004a99", // Deep Blue
  green: "#10b981",   // Success
  yellow: "#f59e0b",  // Warning
  red: "#ef4444",     // Danger
  slate: "#94a3b8",   // Neutral
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

  const completedEvals = evaluations.filter((e) => e.status === "completed")

  const stats = {
    totalCenters: centers.length,
    totalEvaluations: evaluations.length,
    approvedSites: completedEvals.filter((e) => e.score_level === "green").length,
    pendingReview: evaluations.filter((e) => e.status === "pending").length,
  }

  // Chart Data
  const scoreDist = [
    { name: "0-20", count: completedEvals.filter((e) => (e.total_score || 0) <= 20).length },
    { name: "21-40", count: completedEvals.filter((e) => (e.total_score || 0) > 20 && (e.total_score || 0) <= 40).length },
    { name: "41-60", count: completedEvals.filter((e) => (e.total_score || 0) > 40 && (e.total_score || 0) <= 60).length },
    { name: "61-80", count: completedEvals.filter((e) => (e.total_score || 0) > 60 && (e.total_score || 0) <= 80).length },
    { name: "81-100", count: completedEvals.filter((e) => (e.total_score || 0) > 80).length },
  ]

  const statusDist = [
    { name: "Approved", value: stats.approvedSites, color: COLORS.green },
    { name: "Conditional", value: completedEvals.filter((e) => e.score_level === "yellow").length, color: COLORS.yellow },
    { name: "Not Approved", value: completedEvals.filter((e) => e.score_level === "red").length, color: COLORS.red },
    { name: "Pending", value: stats.pendingReview, color: COLORS.slate },
  ].filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Executive Dashboard</h1>
          <p className="text-slate-500">Real-time site evaluation analytics and performance monitoring</p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Centers", value: stats.totalCenters, icon: Building2, color: "bg-blue-50 text-blue-600", trend: "+12%", up: true },
          { label: "Evaluations", value: stats.totalEvaluations, icon: Activity, color: "bg-indigo-50 text-indigo-600", trend: "+5%", up: true },
          { label: "Approved Sites", value: stats.approvedSites, icon: CheckCircle2, color: "bg-green-50 text-green-600", trend: "+8%", up: true },
          { label: "Pending Review", value: stats.pendingReview, icon: Clock, color: "bg-amber-50 text-amber-600", trend: "-2%", up: false },
        ].map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col justify-between hover:shadow-md transition-all border-b-4 border-b-transparent hover:border-b-primary-600">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Score Distribution
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">By Range</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
              Status Distribution
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global State</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
