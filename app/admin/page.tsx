"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  Building2,
  ClipboardCheck,
  TrendingUp,
  RefreshCw,
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

  // Real DB fields
  status: "pending" | "completed"
  score_level: "green" | "yellow" | "red" | null

  created_at: string
}

/* =========================
   Colors
========================= */

const COLORS = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
}

/* =========================
   Dashboard Component
========================= */

export default function AdminDashboard() {
  const supabase = supabaseBrowser()

  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  /* =========================
     Load Data
  ========================= */
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

  /* =========================
     Stats Calculation
  ========================= */

  const completedEvaluations = evaluations.filter(
    (e) => e.status === "completed"
  )

  const stats = {
    totalCenters: centers.length,
    totalEvaluations: evaluations.length,

    greenCount: completedEvaluations.filter(
      (e) => e.score_level === "green"
    ).length,

    yellowCount: completedEvaluations.filter(
      (e) => e.score_level === "yellow"
    ).length,

    redCount: completedEvaluations.filter(
      (e) => e.score_level === "red"
    ).length,

    avgScore:
      completedEvaluations.length > 0
        ? Math.round(
            completedEvaluations.reduce(
              (acc, e) => acc + (e.total_score || 0),
              0
            ) / completedEvaluations.length
          )
        : 0,
  }

  /* =========================
     Chart Data
  ========================= */

  const statusChartData = [
    { name: "Approved", value: stats.greenCount, color: COLORS.green },
    { name: "Conditional", value: stats.yellowCount, color: COLORS.yellow },
    { name: "Not Approved", value: stats.redCount, color: COLORS.red },
  ].filter((d) => d.value > 0)

  const latestEvaluations = evaluations.slice(0, 5)

  const scoreRanges = [
    { range: "0-20", count: completedEvaluations.filter((e) => (e.total_score || 0) < 20).length },
    { range: "20-40", count: completedEvaluations.filter((e) => (e.total_score || 0) >= 20 && (e.total_score || 0) < 40).length },
    { range: "40-60", count: completedEvaluations.filter((e) => (e.total_score || 0) >= 40 && (e.total_score || 0) < 60).length },
    { range: "60-80", count: completedEvaluations.filter((e) => (e.total_score || 0) >= 60 && (e.total_score || 0) < 80).length },
    { range: "80-100", count: completedEvaluations.filter((e) => (e.total_score || 0) >= 80).length },
  ]

  /* =========================
     Helpers
  ========================= */

  function getCenterName(centerId: string) {
    return centers.find((c) => c.id === centerId)?.name || "Unknown"
  }

  function getStatusBadge(level: string | null, status: string) {
    if (status === "pending") {
      return <span className="badge-gray">Pending</span>
    }

    switch (level) {
      case "green":
        return <span className="badge-green">Approved</span>
      case "yellow":
        return <span className="badge-yellow">Conditional</span>
      case "red":
        return <span className="badge-red">Not Approved</span>
      default:
        return <span className="badge-gray">Unknown</span>
    }
  }

  /* =========================
     Loading
  ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  /* =========================
     Render
  ========================= */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Overview of sponsor evaluation metrics
          </p>
        </div>

        <button onClick={loadData} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Total Centers</p>
          <p className="text-3xl font-bold">{stats.totalCenters}</p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Evaluations</p>
          <p className="text-3xl font-bold">{stats.totalEvaluations}</p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Average Score</p>
          <p className="text-3xl font-bold">{stats.avgScore}</p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-2">By Status</p>
          <div className="flex gap-3">
            <span className="text-sm font-semibold text-emerald-600">
              {stats.greenCount} ✓
            </span>
            <span className="text-sm font-semibold text-amber-600">
              {stats.yellowCount} ~
            </span>
            <span className="text-sm font-semibold text-red-600">
              {stats.redCount} ✕
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Status Distribution</h3>

          {statusChartData.length === 0 ? (
            <p className="text-slate-500 text-center py-10">
              No completed evaluations yet
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Score Distribution</h3>

          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={scoreRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="card">
        <div className="p-6 border-b">
          <h3 className="font-semibold">Recent Evaluations</h3>
        </div>

        {latestEvaluations.length === 0 ? (
          <p className="p-6 text-slate-500">No evaluations yet</p>
        ) : (
          <div className="divide-y">
            {latestEvaluations.map((ev) => (
              <div key={ev.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">{getCenterName(ev.center_id)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {ev.total_score ?? "—"}
                  </span>
                  {getStatusBadge(ev.score_level, ev.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
