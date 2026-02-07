"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  Settings2, 
  RefreshCw, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"

export default function CriteriaManagementPage() {
  const supabase = supabaseBrowser()
  const [criteria, setCriteria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    async function loadCriteria() {
      const { data } = await supabase.from("criteria").select("*").order("id", { ascending: true })
      if (data) setCriteria(data)
      setLoading(false)
    }
    loadCriteria()
  }, [supabase])

  const handleUpdate = async (id: number, updates: any) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const saveChanges = async () => {
    setSaving(true)
    setMessage(null)
    
    // For simplicity in this UI, we update one by one or batch
    // Here we'll just show the intent. In a real app, we'd use a robust batch update.
    const { error } = await supabase.from("criteria").upsert(criteria)
    
    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'All criteria updated successfully!' })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Evaluation Setup</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Manage scoring questions and weights</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={saveChanges}
            disabled={saving}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-100 px-8"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="col-span-1">ID</div>
          <div className="col-span-6">Question Name</div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-center">Weight</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {criteria.map((c) => (
            <div key={c.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors">
              <div className="col-span-1 font-black text-slate-300">#{c.id}</div>
              <div className="col-span-6">
                <input 
                  type="text" 
                  value={c.name} 
                  onChange={(e) => handleUpdate(c.id, { name: e.target.value })}
                  className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-800 p-0 text-sm"
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <select 
                  value={c.response_type}
                  onChange={(e) => handleUpdate(c.id, { response_type: e.target.value })}
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-100 border-none rounded-lg focus:ring-primary-500 py-1"
                >
                  <option value="boolean">Scoring (Y/N)</option>
                  <option value="text">Development</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1">
                  <input 
                    type="number" 
                    value={c.weight} 
                    onChange={(e) => handleUpdate(c.id, { weight: parseInt(e.target.value) || 0 })}
                    className="w-12 text-center border-none focus:ring-0 p-0 text-sm font-black text-primary-600"
                  />
                  <span className="text-[10px] font-bold text-slate-300">pts</span>
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-xs hover:text-primary-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add New Question
          </button>
        </div>
      </div>
    </div>
  )
}
