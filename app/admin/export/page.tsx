"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { 
  Download,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  Check,
  Building2,
  ClipboardCheck,
  Scale
} from "lucide-react"

type Center = {
  id: string
  name: string
  code: string
  country: string
  city: string
  contact_name?: string
  contact_email?: string
}

type Evaluation = {
  id: string
  center_id: string
  total_score: number
  status: 'green' | 'yellow' | 'red'
  notes?: string
  created_at: string
}

type Criterion = {
  id: string
  name: string
  category: string
  weight: number
}

export default function ExportPage() {
  const supabase = supabaseBrowser()
  const [centers, setCenters] = useState<Center[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [loading, setLoading] = useState(true)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exportType, setExportType] = useState<'evaluations' | 'centers' | 'all'>('evaluations')
  const [exported, setExported] = useState(false)

  async function loadData() {
    setLoading(true)
    
    const [centersRes, evalsRes, criteriaRes] = await Promise.all([
      supabase.from('centers').select('*'),
      supabase.from('evaluations').select('*').order('created_at', { ascending: false }),
      supabase.from('criteria').select('*')
    ])

    if (centersRes.data) setCenters(centersRes.data)
    if (evalsRes.data) setEvaluations(evalsRes.data)
    if (criteriaRes.data) setCriteria(criteriaRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function getCenterName(centerId: string): string {
    return centers.find(c => c.id === centerId)?.name || 'Unknown'
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'green': return 'Approved'
      case 'yellow': return 'Conditional'
      case 'red': return 'Not Approved'
      default: return 'Unknown'
    }
  }

  function generateCSV(): string {
    if (exportType === 'centers') {
      const headers = ['ID', 'Name', 'Code', 'Country', 'City', 'Contact', 'Email']
      const rows = centers.map(c => [
        c.id,
        c.name,
        c.code,
        c.country,
        c.city,
        c.contact_name || '',
        c.contact_email || '',
      ])
      return [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    }

    if (exportType === 'evaluations') {
      const headers = ['ID', 'Center', 'Score', 'Status', 'Date', 'Notes']
      const rows = evaluations.map(e => [
        e.id,
        getCenterName(e.center_id),
        e.total_score,
        getStatusLabel(e.status),
        new Date(e.created_at).toLocaleDateString('en-US'),
        e.notes || '',
      ])
      return [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    }

    // All
    const headers = ['Center ID', 'Center Name', 'Code', 'Country', 'City', 'Eval ID', 'Score', 'Status', 'Date']
    const rows: string[][] = []
    
    centers.forEach(center => {
      const centerEvals = evaluations.filter(e => e.center_id === center.id)
      if (centerEvals.length === 0) {
        rows.push([center.id, center.name, center.code, center.country, center.city, '', '', '', ''])
      } else {
        centerEvals.forEach(eval_ => {
          rows.push([
            center.id,
            center.name,
            center.code,
            center.country,
            center.city,
            eval_.id,
            String(eval_.total_score),
            getStatusLabel(eval_.status),
            new Date(eval_.created_at).toLocaleDateString('en-US'),
          ])
        })
      }
    })

    return [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
  }

  function generateJSON(): string {
    if (exportType === 'centers') {
      return JSON.stringify(centers, null, 2)
    }
    if (exportType === 'evaluations') {
      const data = evaluations.map(e => ({
        ...e,
        center_name: getCenterName(e.center_id),
        status_label: getStatusLabel(e.status),
      }))
      return JSON.stringify(data, null, 2)
    }
    return JSON.stringify({ centers, evaluations, criteria }, null, 2)
  }

  function handleExport() {
    const content = exportFormat === 'csv' ? generateCSV() : generateJSON()
    const blob = new Blob([content], {
      type: exportFormat === 'csv' ? 'text/csv' : 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `site-scoring-${exportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setExported(true)
    setTimeout(() => setExported(false), 3000)
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Export Data</h1>
        <p className="text-slate-600 mt-1">Download your data in various formats</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Centers</p>
              <p className="text-3xl font-bold text-slate-900">{centers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Evaluations</p>
              <p className="text-3xl font-bold text-slate-900">{evaluations.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Criteria</p>
              <p className="text-3xl font-bold text-slate-900">{criteria.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Scale className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Export Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Data Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Data Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'evaluations', label: 'Evaluations', desc: 'All evaluation records with scores and status' },
                { value: 'centers', label: 'Centers', desc: 'Research center information and contacts' },
                { value: 'all', label: 'Complete Export', desc: 'All data including criteria configuration' },
              ].map((option) => (
                <label 
                  key={option.value} 
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    exportType === option.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={option.value}
                    checked={exportType === option.value}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Format
            </label>
            <div className="space-y-2">
              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'csv' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                />
                <FileSpreadsheet className="w-8 h-8 text-accent-600" />
                <div>
                  <p className="font-medium text-slate-900">CSV</p>
                  <p className="text-sm text-slate-500">Excel compatible spreadsheet</p>
                </div>
              </label>

              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'json' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                />
                <FileJson className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="font-medium text-slate-900">JSON</p>
                  <p className="text-sm text-slate-500">Structured data format</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleExport} className="btn-primary btn-lg">
            {exported ? (
              <>
                <Check className="w-5 h-5" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
        </div>
        <div className="bg-slate-900 p-6 overflow-auto max-h-96">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
            {exportFormat === 'csv' ? generateCSV() : generateJSON()}
          </pre>
        </div>
      </div>
    </div>
  )
}
