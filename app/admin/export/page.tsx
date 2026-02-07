"use client"

import { useEffect, useState } from "react"
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
  RefreshCw
} from "lucide-react"

export default function ExportPage() {
  const supabase = supabaseBrowser()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exported, setExported] = useState(false)

  async function loadData() {
    setLoading(true)
    const { data } = await supabase
      .from('evaluations')
      .select('*, centers(*)')
      .order('created_at', { ascending: false })
    
    if (data) setEvaluations(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExport = () => {
    setExporting(true)
    try {
      if (exportFormat === 'csv') {
        const headers = ["Date", "Center Name", "Country", "Score", "Status", "Evaluator"]
        const rows = evaluations.map(e => [
          new Date(e.created_at).toLocaleDateString(),
          e.centers?.name || 'N/A',
          e.centers?.country || 'N/A',
          e.total_score ?? 'N/A',
          e.score_level || 'Pending',
          e.evaluator_email || 'N/A'
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
        const jsonContent = JSON.stringify(evaluations, null, 2)
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Export Results</h1>
          <p className="text-slate-500">Generate and download comprehensive evaluation reports</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-600" />
              Export Configuration
            </h3>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'csv' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-xs font-bold">CSV</span>
                </button>
                <button 
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'json' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <FileJson className="w-6 h-6" />
                  <span className="text-xs font-bold">JSON</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-primary-100"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : exported ? (
                <>
                  <Check className="w-5 h-5" />
                  Downloaded
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Now
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Data Preview ({evaluations.length} records)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{e.centers?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{e.centers?.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(e.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 text-lg">
                        {e.total_score ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          e.score_level === 'green' ? 'bg-green-100 text-green-700' :
                          e.score_level === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          e.score_level === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {e.score_level === 'green' ? 'Approved' :
                           e.score_level === 'yellow' ? 'Conditional' : 
                           e.score_level === 'red' ? 'Not Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
