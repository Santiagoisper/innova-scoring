"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  FileText,
  Download,
  Settings,
  Settings2,
  BarChart3,
  TrendingUp,
  Search,
  Command,
  History,
  X
} from "lucide-react"

interface CommandItem {
  id: string
  label: string
  description: string
  href: string
  icon: React.ElementType
  keywords: string[]
}

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview & metrics",
    href: "/admin",
    icon: LayoutDashboard,
    keywords: ["home", "main", "overview", "metrics", "stats"]
  },
  {
    id: "centers",
    label: "Centers",
    description: "Manage research centers",
    href: "/admin/centers",
    icon: Building2,
    keywords: ["sites", "centers", "manage", "research"]
  },
  {
    id: "evaluations",
    label: "Evaluations",
    description: "View all evaluations",
    href: "/admin/evaluations",
    icon: ClipboardCheck,
    keywords: ["evaluations", "scores", "results", "assessments"]
  },
  {
    id: "evaluate",
    label: "Evaluate Center",
    description: "Score a research center",
    href: "/admin/evaluate",
    icon: ClipboardCheck,
    keywords: ["evaluate", "score", "new", "create", "assess"]
  },
  {
    id: "criteria",
    label: "Evaluation Setup",
    description: "Manage evaluation parameters",
    href: "/admin/criteria",
    icon: Settings2,
    keywords: ["criteria", "parameters", "setup", "questions"]
  },
  {
    id: "rubric",
    label: "Rubric",
    description: "View & edit scoring weights",
    href: "/admin/rubric",
    icon: FileText,
    keywords: ["rubric", "weights", "scoring", "criteria"]
  },
  {
    id: "benchmark",
    label: "Benchmark",
    description: "Compare center performance",
    href: "/admin/benchmark",
    icon: BarChart3,
    keywords: ["benchmark", "compare", "ranking", "performance"]
  },
  {
    id: "dynamics",
    label: "Dynamics",
    description: "Trend analysis over time",
    href: "/admin/dynamics",
    icon: TrendingUp,
    keywords: ["dynamics", "trends", "analysis", "time"]
  },
  {
    id: "export",
    label: "Export Reports",
    description: "Download CSV/JSON reports",
    href: "/admin/export",
    icon: Download,
    keywords: ["export", "download", "csv", "json", "reports"]
  },
  {
    id: "activity",
    label: "Activity Log",
    description: "View system activity history",
    href: "/admin/activity",
    icon: History,
    keywords: ["activity", "log", "audit", "history", "events"]
  },
  {
    id: "settings",
    label: "Settings",
    description: "Admin preferences",
    href: "/admin/settings",
    icon: Settings,
    keywords: ["settings", "preferences", "config", "admin"]
  },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query.length === 0
    ? COMMANDS
    : COMMANDS.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.keywords.some((k) => k.includes(q))
        )
      })

  const handleOpen = useCallback(() => {
    setOpen(true)
    setQuery("")
    setSelectedIndex(0)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }, [])

  const handleSelect = useCallback((item: CommandItem) => {
    handleClose()
    router.push(item.href)
  }, [router, handleClose])

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (open) {
          handleClose()
        } else {
          handleOpen()
        }
      }
      if (e.key === "Escape" && open) {
        handleClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, handleOpen, handleClose])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Keyboard navigation within the palette
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault()
      handleSelect(filtered[selectedIndex])
    }
  }

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement
      if (selected) {
        selected.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent outline-none text-slate-900 text-sm placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-indigo-50 text-indigo-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  index === selectedIndex ? "bg-indigo-100" : "bg-slate-100"
                }`}>
                  <cmd.icon className={`w-4 h-4 ${
                    index === selectedIndex ? "text-indigo-600" : "text-slate-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{cmd.label}</p>
                  <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                </div>
                {index === selectedIndex && (
                  <kbd className="text-xs text-indigo-500 font-mono">Enter</kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">&uarr;</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">&darr;</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Enter</kbd>
              Open
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />K to toggle
          </span>
        </div>
      </div>
    </div>
  )
}
