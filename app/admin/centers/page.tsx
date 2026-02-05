"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
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
    if (!evalRow) {
      return { label: "Not Evaluated", class: "badge-gray" }
    }

    if (evalRow.status === "pending") {
      return { label: "Pending Link", class: "badge-gray" }
    }

    switch (evalRow.score_level) {
      case "green":
        return { label: "Approved", class: "badge-green" }
      case "yellow":
        return { label: "Conditional", class: "badge-yellow" }
      case "red":
        return { label: "Not Approved", class: "badge-red" }
      default:
        return { label: "Completed", class: "badge-gray" }
    }
  }

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function generateEvaluationLink(center: Center) {
    const res = await fetch("/api/admin/create-evaluation-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        center_id: center.id,
        evaluator_email: "sponsor@demo.com",
      }),
    })

    if (!res.ok) {
      alert("Error generating evaluation link")
      return
    }

    await loadData()
  }

  function copyToClipboard(token: string) {
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
      setNewCenter({
        name: "",
        code: "",
        country: "",
        city: "",
        address: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      })
      loadData()
    }

    setSaving(false)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Centers
          </h1>
          <p className="text-slate-600 mt-1">
            Manage research centers and generate sponsor evaluation links
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Center
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search centers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12"
        />
      </div>

      {/* Centers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="table-header px-6 py-4">Center</th>
                <th className="table-header px-4 py-4">Location</th>
                <th className="table-header px-4 py-4">Status</th>
                <th className="table-header px-4 py-4">Score</th>
                <th className="table-header px-4 py-4">Evaluation Link</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCenters.map((center) => {
                const latestEval = getLatestEvaluation(center.id)
                const status = getStatusInfo(latestEval)

                return (
                  <tr key={center.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {center.name}
                      </p>
                      <p className="text-xs text-slate-500">{center.code}</p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {center.city}, {center.country}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className={status.class}>{status.label}</span>
                    </td>

                    <td className="px-4 py-4 font-bold text-lg">
                      {latestEval?.total_score ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      {latestEval?.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-[140px] truncate">
                            {latestEval.token}
                          </code>

                          <button
                            onClick={() => copyToClipboard(latestEval.token)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                          >
                            {copiedToken === latestEval.token ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          <a
                            href={`/cliente/${latestEval.token}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-slate-100"
                          >
                            <ExternalLink className="w-4 h-4 text-slate-500" />
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateEvaluationLink(center)}
                          className="btn-sm btn-primary flex items-center gap-2"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Generate Link
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Center Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-bold">Add New Center</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddCenter} className="p-6 space-y-4">
              <input
                placeholder="Center name"
                value={newCenter.name}
                onChange={(e) =>
                  setNewCenter((p) => ({ ...p, name: e.target.value }))
                }
                className="input"
                required
              />

              <input
                placeholder="Code"
                value={newCenter.code}
                onChange={(e) =>
                  setNewCenter((p) => ({ ...p, code: e.target.value }))
                }
                className="input"
                required
              />

              <input
                placeholder="Country"
                value={newCenter.country}
                onChange={(e) =>
                  setNewCenter((p) => ({ ...p, country: e.target.value }))
                }
                className="input"
                required
              />

              <input
                placeholder="City"
                value={newCenter.city}
                onChange={(e) =>
                  setNewCenter((p) => ({ ...p, city: e.target.value }))
                }
                className="input"
                required
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Saving..." : "Add Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
