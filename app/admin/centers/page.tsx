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
    if (!evalRow) return { label: "Not Evaluated", class: "bg-slate-100 text-slate-500" }
    if (evalRow.status === "pending") return { label: "Pending Link", class: "bg-slate-100 text-slate-500" }

    switch (evalRow.score_level) {
      case "green": return { label: "Approved", class: "bg-green-100 text-green-700" }
      case "yellow": return { label: "Conditional", class: "bg-yellow-100 text-yellow-700" }
      case "red": return { label: "Not Approved", class: "bg-red-100 text-red-700" }
      default: return { label: "Completed", class: "bg-slate-100 text-slate-500" }
    }
  }

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Centers Management</h1>
          <p className="text-slate-500">Manage research sites and monitor evaluation status</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Site
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search sites by name, code or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12 py-4 shadow-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Site Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCenters.map((center) => {
                const latestEval = getLatestEvaluation(center.id)
                const status = getStatusInfo(latestEval)
                return (
                  <tr 
                    key={center.id} 
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/centers/${center.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary-50 transition-colors">
                          <Building2 className="w-5 h-5 text-slate-400 group-hover:text-primary-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{center.name}</p>
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.class}`}>
                        {status.label}
                      </span>
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
                          <button onClick={(e) => generateEvaluationLink(center, e)} className="btn-sm bg-primary-600 text-white hover:bg-primary-700">
                            <LinkIcon className="w-3 h-3" /> Link
                          </button>
                        )}
                        <button onClick={(e) => deleteCenter(center.id, center.name, e)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-all group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between border-b px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900">Add New Research Site</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddCenter} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Site Name</label>
                  <input placeholder="e.g. CINME Hospital" value={newCenter.name} onChange={(e) => setNewCenter(p => ({ ...p, name: e.target.value }))} className="input" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Site Code</label>
                  <input placeholder="e.g. AR-001" value={newCenter.code} onChange={(e) => setNewCenter(p => ({ ...p, code: e.target.value }))} className="input" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                  <input placeholder="Argentina" value={newCenter.country} onChange={(e) => setNewCenter(p => ({ ...p, country: e.target.value }))} className="input" required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input placeholder="Buenos Aires" value={newCenter.city} onChange={(e) => setNewCenter(p => ({ ...p, city: e.target.value }))} className="input" required />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 py-4">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-4">{saving ? "Saving..." : "Create Site"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
