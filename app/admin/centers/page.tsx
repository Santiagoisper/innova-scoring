"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Search,
  MapPin,
  RefreshCw,
  X,
  Link as LinkIcon,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

type Center = {
  id: string
  name: string
  code: string
  country: string
  city: string
  address?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
}

type Evaluation = {
  id: string
  center_id: string
  token: string
  status: "pending" | "completed"
  total_score: number | null
  score_level: "green" | "yellow" | "red" | null
  created_at: string
}

export default function CentersPage() {
  const supabase = supabaseBrowser()
  const router = useRouter()

  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newCenter, setNewCenter] = useState({
    name: "",
    code: "",
    country: "",
    city: "",
    address: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  })

  async function loadData() {
    setLoading(true)
    const [centersRes, evalsRes] = await Promise.all([
      supabase.from("centers").select("*"),
      supabase
        .from("evaluations")
        .select("id, center_id, token, status, total_score, score_level, created_at")
        .order("created_at", { ascending: false }),
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function getLatestEvaluation(centerId: string) {
    return evaluations.find((e) => e.center_id === centerId)
  }

  function getStatusInfo(evalRow?: Evaluation) {
    if (!evalRow) return { label: "Not Evaluated", class: "bg-slate-100 text-slate-500", icon: AlertCircle, color: "slate" }
    if (evalRow.status === "pending") return { label: "Pending Link", class: "bg-slate-100 text-slate-500", icon: AlertCircle, color: "slate" }

    switch (evalRow.score_level) {
      case "green": return { label: "Approved", class: "bg-green-100 text-green-700", icon: CheckCircle, color: "green" }
      case "yellow": return { label: "Conditional", class: "bg-yellow-100 text-yellow-700", icon: AlertCircle, color: "yellow" }
      case "red": return { label: "Not Approved", class: "bg-red-100 text-red-700", icon: XCircle, color: "red" }
      default: return { label: "Completed", class: "bg-slate-100 text-slate-500", icon: AlertCircle, color: "slate" }
    }
  }

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Agrupar centros por estado
  const groupedCenters = {
    approved: filteredCenters.filter(c => getLatestEvaluation(c.id)?.score_level === "green"),
    conditional: filteredCenters.filter(c => getLatestEvaluation(c.id)?.score_level === "yellow"),
    notApproved: filteredCenters.filter(c => getLatestEvaluation(c.id)?.score_level === "red"),
    pending: filteredCenters.filter(c => {
      const evaluation = getLatestEvaluation(c.id);
      return !evaluation || evaluation.status === "pending" || (evaluation.status === "completed" && !evaluation.score_level);
    }),
  }

  async function generateEvaluationLink(center: Center, e: React.MouseEvent) {
    e.stopPropagation()
    const res = await fetch("/api/admin/create-evaluation-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        center_id: center.id,
        evaluator_email: "sponsor@demo.com",
      }),
    })
    if (res.ok) await loadData()
  }

  async function deleteCenter(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return
    const { error } = await supabase.from("centers").delete().eq("id", id)
    if (!error) loadData()
  }

  function copyToClipboard(token: string, e: React.MouseEvent) {
    e.stopPropagation()
    const link = `${window.location.origin}/cliente/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function handleAddCenter(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("centers").insert([newCenter])
    if (!error) {
      setShowAddModal(false)
      setNewCenter({ name: "", code: "", country: "", city: "", address: "", contact_name: "", contact_email: "", contact_phone: "" })
      loadData()
    }
    setSaving(false)
  }

  const CenterRow = ({ center }: { center: Center }) => {
    const latestEval = getLatestEvaluation(center.id)
    const status = getStatusInfo(latestEval)
    const StatusIcon = status.icon

    return (
      <tr
        key={center.id}
        className="hover:bg-slate-50/80 transition-all cursor-pointer group border-b border-slate-100"
        onClick={() => router.push(`/admin/centers/${center.id}`)}
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{center.name}</p>
              <p className="text-xs text-slate-500 font-medium">{center.code}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-300" />
            {center.city}, {center.country}
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" />
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.class}`}>
              {status.label}
            </span>
          </div>
        </td>
        <td className="px-6 py-5">
          <span className="text-xl font-black text-slate-900">{latestEval?.total_score ?? "—"}</span>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center justify-end gap-2">
            {latestEval?.status === "pending" ? (
              <div className="flex items-center gap-1">
                <button onClick={(e) => copyToClipboard(latestEval.token, e)} className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
                  {copiedToken === latestEval.token ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
                <a href={`/cliente/${latestEval.token}`} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            ) : (
              <button onClick={(e) => generateEvaluationLink(center, e)} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Link
              </button>
            )}
            <button onClick={(e) => deleteCenter(center.id, center.name, e)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
          </div>
        </td>
      </tr>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Centros</h1>
          <p className="text-slate-500">Gestiona sitios de investigación y monitorea el estado de evaluación</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Agregar Sitio
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Busca sitios por nombre, código o ubicación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Approved Section */}
      {groupedCenters.approved.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-200 overflow-hidden shadow-sm">
          <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-green-900">Aprobados ({groupedCenters.approved.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Sitio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groupedCenters.approved.map(center => <CenterRow key={center.id} center={center} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditional Section */}
      {groupedCenters.conditional.length > 0 && (
        <div className="bg-white rounded-2xl border border-yellow-200 overflow-hidden shadow-sm">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-900">Condicionales ({groupedCenters.conditional.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Sitio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groupedCenters.conditional.map(center => <CenterRow key={center.id} center={center} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Not Approved Section */}
      {groupedCenters.notApproved.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-900">No Aprobados ({groupedCenters.notApproved.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Sitio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groupedCenters.notApproved.map(center => <CenterRow key={center.id} center={center} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Section */}
      {groupedCenters.pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Pendientes ({groupedCenters.pending.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Sitio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groupedCenters.pending.map(center => <CenterRow key={center.id} center={center} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCenters.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">No se encontraron centros</p>
        </div>
      )}
    </div>
  )
}
