"use client"

import { useEffect, useState, useCallback } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  Mail,
  RefreshCw,
  Search,
  Building2,
  User,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  Eye
} from "lucide-react"

type ContactRequest = {
  id: string
  contact_name: string
  email: string
  site_name: string
  message: string | null
  status: string
  created_at: string
}

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    const supabase = supabaseBrowser()

    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function markAsReviewed(id: string) {
    setUpdating(id)
    const supabase = supabaseBrowser()

    await supabase
      .from('contact_requests')
      .update({ status: 'reviewed' })
      .eq('id', id)

    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'reviewed' } : r)
    )
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => prev ? { ...prev, status: 'reviewed' } : null)
    }
    setUpdating(null)
  }

  async function deleteRequest(id: string) {
    if (!confirm('Are you sure you want to delete this contact request?')) return

    setUpdating(id)
    const supabase = supabaseBrowser()

    await supabase
      .from('contact_requests')
      .delete()
      .eq('id', id)

    setRequests(prev => prev.filter(r => r.id !== id))
    if (selectedRequest?.id === id) {
      setSelectedRequest(null)
    }
    setUpdating(null)
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filtered = requests.filter(r => {
    if (filter === 'pending' && r.status !== 'pending') return false
    if (filter === 'reviewed' && r.status !== 'reviewed') return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        r.contact_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.site_name.toLowerCase().includes(q) ||
        (r.message && r.message.toLowerCase().includes(q))
      )
    }
    return true
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Contact Requests</h1>
          <p className="text-slate-600 mt-1">Inquiries from the landing page form</p>
        </div>
        <button
          onClick={loadRequests}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{requests.length}</p>
          <p className="text-xs text-slate-400">requests</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-xs text-slate-400">to review</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Reviewed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{requests.length - pendingCount}</p>
          <p className="text-xs text-slate-400">completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, site..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'pending', 'reviewed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No contact requests found</p>
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`card p-4 cursor-pointer transition-all hover:shadow-md border ${
                  selectedRequest?.id === req.id
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : req.status === 'pending'
                    ? 'border-amber-100 bg-amber-50/30'
                    : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{req.contact_name}</p>
                      {req.status === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex-shrink-0">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
                          Reviewed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{req.email}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {req.site_name}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(req.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="card p-6 space-y-5 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Details</h3>
                {selectedRequest.status === 'pending' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    Reviewed
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Contact Person</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedRequest.contact_name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Email</p>
                  <a
                    href={`mailto:${selectedRequest.email}`}
                    className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedRequest.email}
                  </a>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Research Site</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {selectedRequest.site_name}
                  </p>
                </div>

                {selectedRequest.message && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Message</p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Submitted</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => markAsReviewed(selectedRequest.id)}
                    disabled={updating === selectedRequest.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                )}
                <button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  disabled={updating === selectedRequest.id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Eye className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-400">Select a request to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
