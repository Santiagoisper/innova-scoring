import Link from "next/link"
import { Sparkles, AlertCircle } from "lucide-react"

export default function ClienteIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Site Self-Assessment Portal
        </h1>
        <p className="text-slate-600 mb-8">
          Welcome to the Innova Trials site evaluation portal. 
          To complete your self-assessment, you need a unique evaluation link.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-amber-800">Missing Evaluation Link</p>
              <p className="text-sm text-amber-700 mt-1">
                If you haven't received your evaluation link, please contact your 
                study coordinator or the Innova Trials team.
              </p>
            </div>
          </div>
        </div>

        <Link 
          href="/"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  )
}
