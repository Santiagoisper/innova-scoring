"use client"

import { useEffect, useState, useCallback } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  History,
  RefreshCw,
  ClipboardCheck,
  Building2,
  Calendar,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search
} from "lucide-react"

type ActivityEvent = {
  id: string
  type: 'evaluation_created' | 'evaluation_completed' | 'center_created'
  timestamp: string
  centerName: string
  centerCity: string
  centerCountry: string
  score: number | null
  scoreLevel: string | null
  status: string
  evaluationId?: string
  centerId?: string
}

type Center = {
  id: string
  name: string
  city: string
  country: string
  created_at: string
}

type Evaluation = {
  id: string
  center_id: string
  total_score: number | null
  status: string
  score_level: string | null
  created_at: string
  centers?: {
    name: string
    city: string
    country: string
  }
}

export default function ActivityLogPage() {
  const supabase = supabaseBrowser()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'evaluations' | 'centers'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadActivity = useCallback(async () => {
    setLoading(true)

    const [evalsRes, centersRes] = await Promise.all([
      supabase
        .from('evaluations')
        .select('*, centers(name, city, country)')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('centers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    const activityEvents: ActivityEvent[] = []

    // Map evaluations to events
    if (evalsRes.data) {
      for (const ev of evalsRes.data as Evaluation[]) {
        const isCompleted = ev.status === 'completed' || ev.status === 'submitted'

        activityEvents.push({
          id: `eval-${ev.id}`,
          type: isCompleted ? 'evaluation_completed' : 'evaluation_created',
          timestamp: ev.created_at,
          centerName: ev.centers?.name || 'Unknown',
          centerCity: ev.centers?.city || '',
          centerCountry: ev.centers?.country || '',
          score: ev.total_score,
          scoreLevel: ev.score_level,
          status: ev.status,
          evaluationId: ev.id,
          centerId: ev.center_id
        })
      }
    }

    // Map centers to events
    if (centersRes.data) {
      for (const c of centersRes.data as Center[]) {
        activityEvents.push({
          id: `center-${c.id}`,
          type: 'center_created',
          timestamp: c.created_at,
          centerName: c.name,
          centerCity: c.city,
          centerCountry: c.country,
          score: null,
          scoreLevel: null,
          status: '',
          centerId: c.id
        })
      }
    }

    // Sort by timestamp descending
    activityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setEvents(activityEvents)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  function getEventIcon(type: ActivityEvent['type']) {
    switch (type) {
      case 'evaluation_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case 'evaluation_created':
        return <Clock className="w-4 h-4 text-amber-500" />
      case 'center_created':
        return <Building2 className="w-4 h-4 text-indigo-600" />
    }
  }

  function getEventLabel(type: ActivityEvent['type']) {
    switch (type) {
      case 'evaluation_completed':
        return 'Evaluation Completed'
      case 'evaluation_created':
        return 'Evaluation Created'
      case 'center_created':
        return 'Center Registered'
    }
  }

  function getEventBg(type: ActivityEvent['type']) {
    switch (type) {
      case 'evaluation_completed':
        return 'bg-emerald-50 border-emerald-100'
      case 'evaluation_created':
        return 'bg-amber-50 border-amber-100'
      case 'center_created':
        return 'bg-indigo-50 border-indigo-100'
    }
  }

  function formatTimestamp(ts: string) {
    const date = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  function formatFullDate(ts: string) {
    return new Date(ts).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Group events by date
  function groupByDate(events: ActivityEvent[]) {
    const groups: Record<string, ActivityEvent[]> = {}
    for (const event of events) {
      const date = new Date(event.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(event)
    }
    return groups
  }

  // Apply filters
  const filteredEvents = events.filter(e => {
    if (filter === 'evaluations' && e.type === 'center_created') return false
    if (filter === 'centers' && e.type !== 'center_created') return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        e.centerName.toLowerCase().includes(q) ||
        e.centerCity.toLowerCase().includes(q) ||
        e.centerCountry.toLowerCase().includes(q) ||
        getEventLabel(e.type).toLowerCase().includes(q)
      )
    }
    return true
  })

  const grouped = groupByDate(filteredEvents)

  // Stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = events.filter(e => new Date(e.timestamp) >= todayStart)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekEvents = events.filter(e => new Date(e.timestamp) >= weekStart)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Activity Log</h1>
          <p className="text-slate-600 mt-1">Timeline of all system events and changes</p>
        </div>
        <button
          onClick={loadActivity}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{todayEvents.length}</p>
          <p className="text-xs text-slate-400">events</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">This Week</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{weekEvents.length}</p>
          <p className="text-xs text-slate-400">events</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{events.length}</p>
          <p className="text-xs text-slate-400">tracked events</p>
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
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'evaluations', 'centers'] as const).map((f) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">No activity events found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dateEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">{date}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {dateEvents.length}
                </span>
              </div>

              <div className="space-y-3 ml-2 border-l-2 border-slate-100 pl-6">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`card p-4 border ${getEventBg(event.type)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {getEventLabel(event.type)}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {event.centerName}
                            <span className="text-slate-400"> — </span>
                            <span className="text-xs text-slate-500">
                              {event.centerCity}, {event.centerCountry}
                            </span>
                          </p>

                          {event.score !== null && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-bold text-slate-700">
                                Score: {event.score}
                              </span>
                              {event.scoreLevel && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  event.scoreLevel === 'green'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : event.scoreLevel === 'yellow'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {event.scoreLevel === 'green' ? 'Approved' : event.scoreLevel === 'yellow' ? 'Conditional' : 'Not Approved'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 whitespace-nowrap" title={formatFullDate(event.timestamp)}>
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
