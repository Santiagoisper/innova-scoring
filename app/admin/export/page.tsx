"use client"

import { useEffect, useState, useCallback } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  Download, 
  FileSpreadsheet, 
  FileJson,
  Search, 
  Filter,
  Loader2,
  Calendar,
  Building2,
  Check,
  RefreshCw,
  Trash2,
  AlertCircle
} from "lucide-react"

export default function ExportPage() {
  const supabase = supabaseBrowser()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exported, setExported] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('evaluations')
      .select('*, centers(*)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Error loading evaluations:", error)
    } else {
      setEvaluations(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this evaluation record? This will permanently remove the results from the database. The center itself will not be deleted.")) return
    
    setDeleting(id)
    try {
      const { error } = await supabase
        .from("evaluations")
        .delete()
        .eq("id", id)
      
      if (error) throw error

      // Update local state only after successful DB deletion
      setEvaluations(prev => prev.filter(e => e.id !== id))
    } catch (error: any) {
      console.error("Delete failed:", error)
      alert("Error deleting record: " + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    setExporting(true)
    const dataToExport = filtered
    try {
      if (exportFormat === 'csv') {
        const headers = ["Date", "Center Name", "Code", "Country", "Score", "Status"]
        const rows = dataToExport.map(e => [
          new Date(e.created_at).toLocaleDateString(),
          e.centers?.name || 'N/A',
          e.centers?.code || 'N/A',
          e.centers?.country || 'N/A',
          e.total_score ?? 'N/A',
          e.score_level || 'Pending'
        ])

        const csvContent = [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `innova_scoring_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const jsonContent = JSON.stringify(dataToExport, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `innova_scoring_export_${new Date().toISOString().split('T')[0]}.json`)
        link.click()
      }
      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } finally {
      setExporting(false)
    }
  }

  const filtered = evaluations.filter(e => 
    e.centers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.centers?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && evaluations.length === 0) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Export Results</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Download and manage site evaluation data</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-8 space-y-8 border-t-4 border-t-primary-600 shadow-xl shadow-slate-200/50">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-600" />
              Configuration
            </h3>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">File Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'csv' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
                </button>
                <button 
                  onClick={() => setExportFormat('json')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'json' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <FileJson className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">JSON</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleExport}
              disabled={exporting || filtered.length === 0}
              className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-lg shadow-primary-200 text-sm font-black uppercase tracking-widest disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : exported ? (
                <>
                  <Check className="w-5 h-5" />
                  Success
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card p-4 flex items-center gap-4 shadow-sm border-slate-100">
            <Search className="w-5 h-5 text-slate-300 ml-2" />
            <input 
              type="text"
              placeholder="Search by site name or code..."
              className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filtered.length} Results
            </div>
          </div>

          <div className="card overflow-hidden shadow-xl shadow-slate-200/50 border-none relative">
            {loading && evaluations.length > 0 && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Site Information</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">No evaluation records found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm leading-tight">{e.centers?.name || 'Unknown Site'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{e.centers?.code} • {e.centers?.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-sm">
                            {e.total_score ?? '—'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${
                              e.score_level === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
                              e.score_level === 'yellow' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                              e.score_level === 'red' ? 'border-red-500 text-red-700 bg-red-50' :
                              'border-slate-200 text-slate-400 bg-slate-50'
                            }`}>
                              {e.score_level === 'green' ? 'Approved' :
                               e.score_level === 'yellow' ? 'Conditional' : 
                               e.score_level === 'red' ? 'Not Approved' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                            <Calendar className="w-3.5 h-3.5 opacity-40" />
                            {new Date(e.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleDelete(e.id)}
                            disabled={deleting === e.id}
                            className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          >
                            {deleting === e.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
