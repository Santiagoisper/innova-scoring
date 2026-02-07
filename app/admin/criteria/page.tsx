"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Settings2,
  FileText,
  BarChart4,
  RefreshCw
} from "lucide-react"

interface Criterion {
  id: number | string
  name: string
  category?: string
  weight: number
  critical?: boolean
  response_type?: 'boolean' | 'text'
  description?: string
}

export default function CriteriaManagement() {
  const supabase = supabaseBrowser()
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    async function loadCriteria() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('criteria')
          .select('*')
          .order('id', { ascending: true })
        
        if (error) throw error
        if (data) setCriteria(data)
      } catch (err: any) {
        console.error("Error loading criteria:", err)
        setMessage({ type: 'error', text: 'Failed to load parameters from database.' })
      } finally {
        setLoading(false)
      }
    }
    loadCriteria()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      // Split into updates and inserts
      const toUpdate = criteria.filter(c => typeof c.id === 'number' && c.id < 1000000000)
      const toInsert = criteria.filter(c => typeof c.id === 'string' || (typeof c.id === 'number' && c.id >= 1000000000))
        .map(({ id, ...rest }) => rest) // Remove temporary ID

      if (toUpdate.length > 0) {
        const { error: updateErr } = await supabase.from('criteria').upsert(toUpdate)
        if (updateErr) throw updateErr
      }

      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from('criteria').insert(toInsert)
        if (insertErr) throw insertErr
      }

      // Reload to get real IDs
      const { data, error: reloadErr } = await supabase.from('criteria').select('*').order('id', { ascending: true })
      if (reloadErr) throw reloadErr
      if (data) setCriteria(data)

      setMessage({ type: 'success', text: 'All evaluation parameters updated successfully.' })
    } catch (err: any) {
      console.error("Save error:", err)
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const updateCriterion = (id: number | string, updates: Partial<Criterion>) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addNew = () => {
    const tempId = `temp-${Date.now()}`
    setCriteria(prev => [...prev, {
      id: tempId,
      name: '',
      category: 'Technical',
      weight: 5,
      critical: false,
      response_type: 'boolean',
      description: ''
    }])
  }

  const remove = async (id: number | string) => {
    if (confirm("Are you sure you want to remove this parameter?")) {
      if (typeof id === 'number' && id < 1000000000) {
        const { error } = await supabase.from('criteria').delete().eq('id', id)
        if (error) {
          setMessage({ type: 'error', text: 'Could not delete from database: ' + error.message })
          return
        }
      }
      setCriteria(prev => prev.filter(c => c.id !== id))
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Parameters...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-20 px-4 sm:px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest">
            <Settings2 className="w-4 h-4" />
            System Configuration
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Evaluation Setup</h1>
          <p className="text-slate-500 font-medium">Define the technical parameters and scoring weights for site assessments.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={addNew} className="btn-secondary flex items-center gap-3 px-6 py-4">
            <Plus className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest text-xs">Add New</span>
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-3 px-8 py-4 shadow-xl shadow-primary-100">
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span className="font-black uppercase tracking-widest text-xs">Save All Changes</span>
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-6 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      <div className="card border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Parameter / Question</th>
                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Type</th>
                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Weight</th>
                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Critical</th>
                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {criteria.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <input 
                      type="text" 
                      value={c.name}
                      onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 p-0 text-lg placeholder:text-slate-200"
                      placeholder="Enter question text..."
                    />
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={c.response_type || 'boolean'}
                      onChange={(e) => updateCriterion(c.id, { response_type: e.target.value as any })}
                      className="bg-slate-50 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 focus:border-primary-300 focus:ring-primary-100 py-2 px-4 cursor-pointer"
                    >
                      <option value="boolean">Scoring (Y/N)</option>
                      <option value="text">Development</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    {c.response_type !== 'text' ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          value={c.weight}
                          onChange={(e) => updateCriterion(c.id, { weight: parseInt(e.target.value) || 0 })}
                          className="w-20 bg-slate-50 border-slate-100 rounded-xl text-sm font-black text-slate-700 text-center py-2 focus:border-primary-300 focus:ring-primary-100"
                        />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">pts</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Not Scored</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => updateCriterion(c.id, { critical: !c.critical })}
                      className={`w-12 h-6 rounded-full transition-all relative ${c.critical ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${c.critical ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => remove(c.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
