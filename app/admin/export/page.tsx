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
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('evaluations')
        .select('id, created_at, total_score, score_level, centers(id, name, code, country)')
        .order('created_at', { ascending: false })
        .limit(1000)
      
      if (error) {
        console.error("Error loading evaluations:", error)
        setEvaluations([])
      } else {
        setEvaluations(data || [])
      }
    } catch (err) {
      console.error("Exception loading data:", err)
      setEvaluations([])
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }, [supabase])

  useEffect(() => {
    // Solo cargar una vez al montar el componente
    if (!hasLoaded) {
      loadData()
    }
  }, [hasLoaded, loadData])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de evaluación? Se eliminará permanentemente de la base de datos. El centro no será eliminado.")) return
    
    setDeleting(id)
    try {
      const { error } = await supabase
        .from("evaluations")
        .delete()
        .eq("id", id)
      
      if (error) throw error

      // Actualizar estado local solo después de la eliminación exitosa en BD
      setEvaluations(prev => prev.filter(e => e.id !== id))
    } catch (error: any) {
      console.error("Delete failed:", error)
      alert("Error al eliminar: " + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = evaluations.filter(e => 
    e.centers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.centers?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    setExporting(true)
    const dataToExport = filtered
    try {
      if (exportFormat === 'csv') {
        const headers = ["Fecha", "Nombre del Sitio", "Código", "País", "Puntaje", "Estado"]
        const rows = dataToExport.map(e => [
          new Date(e.created_at).toLocaleDateString('es-ES'),
          e.centers?.name || 'N/A',
          e.centers?.code || 'N/A',
          e.centers?.country || 'N/A',
          e.total_score ?? 'N/A',
          e.score_level === 'green' ? 'Aprobado' :
          e.score_level === 'yellow' ? 'Condicional' : 
          e.score_level === 'red' ? 'No Aprobado' : 'Pendiente'
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
    } catch (err) {
      console.error("Export error:", err)
      alert("Error al exportar los datos")
    } finally {
      setExporting(false)
    }
  }

  if (loading && !hasLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Exportar Resultados</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Descarga y gestiona los datos de evaluación</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setHasLoaded(false)
              loadData()
            }}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-8 space-y-8 border-t-4 border-t-blue-600 shadow-lg">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Configuración
            </h3>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Formato de Archivo</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'csv' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
                </button>
                <button 
                  onClick={() => setExportFormat('json')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${exportFormat === 'json' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <FileJson className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">JSON</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleExport}
              disabled={exporting || filtered.length === 0}
              className="w-full py-5 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : exported ? (
                <>
                  <Check className="w-5 h-5" />
                  Éxito
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
            <Search className="w-5 h-5 text-slate-300 ml-2" />
            <input 
              type="text"
              placeholder="Busca por nombre de sitio o código..."
              className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filtered.length} Resultados
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Información del Sitio</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Puntaje</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Estado</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">No se encontraron registros de evaluación.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm leading-tight">{e.centers?.name || 'Sitio Desconocido'}</p>
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
                              {e.score_level === 'green' ? 'Aprobado' :
                               e.score_level === 'yellow' ? 'Condicional' : 
                               e.score_level === 'red' ? 'No Aprobado' : 'Pendiente'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                            <Calendar className="w-3.5 h-3.5 opacity-40" />
                            {new Date(e.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleDelete(e.id)}
                            disabled={deleting === e.id}
                            className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50"
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
