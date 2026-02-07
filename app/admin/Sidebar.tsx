"use client"

import { usePathname } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  FileText,
  Download,
  Sparkles,
  Link as LinkIcon,
  Settings2,
  Settings
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = supabaseBrowser()

  const [centerCount, setCenterCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  // ✅ Important: prevents hydration mismatch
  const [ready, setReady] = useState(false)

  /* =========================
     Load Sidebar Metrics
  ========================= */
  async function loadSidebarStats() {
    const centersRes = await supabase.from("centers").select("id")
    const evalsRes = await supabase.from("evaluations").select("id,status")

    if (centersRes.data) setCenterCount(centersRes.data.length)

    if (evalsRes.data) {
      setPendingCount(evalsRes.data.filter((e) => e.status === "pending").length)
      setCompletedCount(
        evalsRes.data.filter((e) => e.status === "completed").length
      )
    }

    // ✅ Render badges only after client loads
    setReady(true)
  }

  useEffect(() => {
    loadSidebarStats()
  }, [])

  /* =========================
     Active Link Styling
  ========================= */
  function navClass(href: string) {
    const active = pathname === href

    return `
      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
      transition-all
      ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-700 hover:bg-slate-100"
      }
    `
  }

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col justify-between shadow-xl">
      {/* =========================
          Brand Header
      ========================= */}
      <div>
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-14 flex items-center justify-center">
              <img src="/innova-logo.png" alt="Innova Trials" className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>

        {/* =========================
            Navigation Links
        ========================= */}
        <div className="p-6 space-y-2">
          {/* Dashboard */}
          <a href="/admin" className={navClass("/admin")}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          {/* Centers */}
          <a href="/admin/centers" className={navClass("/admin/centers")}>
            <Building2 className="w-5 h-5" />
            Centers

            {ready && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
                {centerCount}
              </span>
            )}
          </a>

          {/* Evaluations */}
          <a
            href="/admin/evaluations"
            className={navClass("/admin/evaluations")}
          >
            <ClipboardCheck className="w-5 h-5" />
            Evaluations

            {ready && (
              <span className="ml-auto flex gap-1 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {pendingCount}
                </span>

                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {completedCount}
                </span>
              </span>
            )}
          </a>

          {/* Criteria Management (NEW) */}
          <a href="/admin/criteria" className={navClass("/admin/criteria")}>
            <Settings2 className="w-5 h-5" />
            Evaluation Setup
          </a>

          {/* Rubric */}
          <a href="/admin/rubric" className={navClass("/admin/rubric")}>
            <FileText className="w-5 h-5" />
            Rubric
          </a>

          {/* Export */}
          <a href="/admin/export" className={navClass("/admin/export")}>
            <Download className="w-5 h-5" />
            Export Reports
          </a>

          {/* Settings */}
          <a href="/admin/settings" className={navClass("/admin/settings")}>
            <Settings className="w-5 h-5" />
            Settings
          </a>

          {/* =========================
              Quick Action Box
          ========================= */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
            <p className="text-sm font-bold text-indigo-900 mb-2">
              Quick Action
            </p>

            <a
              href="/admin/centers"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition"
            >
              <LinkIcon className="w-4 h-4" />
              Generate Evaluation Link
            </a>

            <p className="text-xs text-slate-500 mt-2">
              Create sponsor-ready evaluation invitations instantly.
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          Footer (STATIC → No hydration error)
      ========================= */}
      <div className="p-6 border-t border-slate-200 text-xs text-slate-500">
        <p>© Innova Trials — Sponsor Platform</p>
        <p className="mt-2 font-semibold text-slate-700">V.1</p>
        <p className="text-xs text-slate-500 mt-1">By Santiago Isbert Perlender</p>
        <p className="text-xs text-slate-500">Member of Innova Trials Team</p>
      </div>
    </aside>
  )
}
