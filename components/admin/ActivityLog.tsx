"use client"

import { useEffect, useState } from 'react'
import { getRecentActivity } from '@/lib/activity-log'
import { Clock, User, FileText, CheckCircle, XCircle, Send, Edit, Trash2, Plus } from 'lucide-react'

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      const data = await getRecentActivity(20)
      setLogs(data)
    } catch (err) {
      console.error('Failed to load activity logs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 border-none shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-600" />
          Recent Activity
        </h3>
        <button 
          onClick={loadLogs}
          className="text-xs text-slate-500 hover:text-primary-600 font-bold transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {log.admin_name}
                  <span className="font-normal text-slate-600 ml-2">
                    {log.action}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{log.entity_type}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <ActionIcon action={log.action} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ActionIcon({ action }: { action: string }) {
  const iconClass = "w-4 h-4"
  
  if (action.includes('created') || action.includes('added')) {
    return <Plus className={`${iconClass} text-green-500`} />
  }
  if (action.includes('updated') || action.includes('edited')) {
    return <Edit className={`${iconClass} text-blue-500`} />
  }
  if (action.includes('deleted') || action.includes('removed')) {
    return <Trash2 className={`${iconClass} text-red-500`} />
  }
  if (action.includes('sent') || action.includes('email')) {
    return <Send className={`${iconClass} text-purple-500`} />
  }
  if (action.includes('approved')) {
    return <CheckCircle className={`${iconClass} text-emerald-500`} />
  }
  if (action.includes('rejected')) {
    return <XCircle className={`${iconClass} text-red-500`} />
  }
  
  return <FileText className={`${iconClass} text-slate-400`} />
}
