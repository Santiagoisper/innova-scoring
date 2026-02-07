"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Building2, ShieldCheck, BarChart3, Users, ArrowRight, Sparkles, Phone, Mail, MapPin } from 'lucide-react'

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    criteriaCount: 0,
    categoriesCount: 0, // Placeholder, will try to fetch if possible
    maturityLevelsCount: 0, // Placeholder, will try to fetch if possible
  })
  const [loadingMetrics, setLoadingMetrics] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true)
      const supabase = supabaseBrowser()
      
      // Fetch criteria count
      const { count: criteriaCount, error: criteriaError } = await supabase
        .from('criteria')
        .select('*', { count: 'exact' })

      // Fetch categories count (assuming categories are defined in criteria table, e.g., unique values in a 'category' column)
      // If there's no explicit 'category' column, this will need adjustment.
      const { data: distinctCategories, error: categoriesError } = await supabase
        .from('criteria')
        .select('category', { distinct: true })

      // Fetch maturity levels count (assuming maturity levels are defined in criteria table, e.g., unique values in a 'maturity_level' column)
      // If there's no explicit 'maturity_level' column, this will need adjustment.
      const { data: distinctMaturityLevels, error: maturityLevelsError } = await supabase
        .from('criteria')
        .select('maturity_level', { distinct: true })

      if (criteriaError) console.error("Error fetching criteria count:", criteriaError.message)
      if (categoriesError) console.error("Error fetching categories count:", categoriesError.message)
      if (maturityLevelsError) console.error("Error fetching maturity levels count:", maturityLevelsError.message)

      setMetrics({
        criteriaCount: criteriaCount || 0,
        categoriesCount: distinctCategories?.length || 0,
        maturityLevelsCount: distinctMaturityLevels?.length || 0,
      })
      setLoadingMetrics(false)
    }

    fetchMetrics()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 font-display">Innova Trials</h1>
                <p className="text-xs text-slate-500">Site Scoring Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
              <Link href="/admin" className="btn-primary btn-sm">
                Admin Access
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
              <span className="text-xs font-medium text-primary-700">Clinical Research Excellence</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-display leading-tight mb-6 animate-slide-up">
              Evaluate Research Sites
              <span className="block text-primary-600">with Confidence</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up animate-delay-100">
              A comprehensive platform for clinical research organizations to assess, 
              score, and benchmark investigational sites across key criteria.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
              <Link 
                href="/cliente"
                className="btn btn-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 group"
              >
                <Building2 className="w-5 h-5" />
                Client Portal
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/admin"
                className="btn btn-lg btn-outline group"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Access
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-slide-up animate-delay-300">
            {[
              { label: 'Criteria Evaluated', value: loadingMetrics ? '...' : metrics.criteriaCount },
              { label: 'Categories', value: loadingMetrics ? '...' : metrics.categoriesCount },
              { label: 'Maturity Levels', value: loadingMetrics ? '...' : metrics.maturityLevelsCount },
              { label: 'Weighted Scoring', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur border border-white/80 shadow-soft">
                <p className="text-3xl font-bold text-slate-900 font-display">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-display mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools for evaluating clinical research sites with precision and consistency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Weighted Scoring',
                description: 'Each criterion has configurable weights to reflect your priorities. Total scores calculated automatically.',
                color: 'primary',
              },
              {
                icon: Building2,
                title: 'Site Management',
                description: 'Maintain a complete database of research centers with contact info, location, and evaluation history.',
                color: 'accent',
              },
              {
                icon: Users,
                title: 'Client Self-Assessment',
                description: 'Share unique links with sites for self-evaluation. Track completion status in real-time.',
                color: 'primary',
              },
              {
                icon: ShieldCheck,
                title: 'Maturity Model',
                description: 'Five-level maturity classification from Initial to Optimized based on evaluation scores.',
                color: 'accent',
              },
              {
                icon: BarChart3,
                title: 'Benchmarking',
                description: 'Compare sites against averages, medians, and percentiles. Identify top performers.',
                color: 'primary',
              },
              {
                icon: Sparkles,
                title: 'Export & Reports',
                description: 'Download data in CSV or JSON. Generate reports for sponsors and internal review.',
                color: 'accent',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl ${
                  feature.color === 'primary' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-accent-100 text-accent-600'
                } flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-display mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A simple, streamlined process for comprehensive site evaluation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Share Link',
                description: 'Generate a unique evaluation link for each research site and share it with them.',
              },
              {
                step: '02',
                title: 'Complete Assessment',
                description: 'Sites complete the self-assessment across all criteria with supporting notes.',
              },
              {
                step: '03',
                title: 'Analyze Results',
                description: 'Review scores, compare against benchmarks, and make informed site selection decisions.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="card p-8 h-full">
                  <span className="text-5xl font-bold text-slate-100 font-display">{item.step}</span>
                  <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-slate-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZ24+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-6">
            Ready to Evaluate Your Sites?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Start using Site Scoring today to make data-driven decisions about your clinical research network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/admin"
              className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Innova Trials</p>
                <p className="text-slate-400 text-sm">Site Scoring Platform v5.0</p>
              </div>
            </div>
            <div className="text-slate-400 text-sm text-center md:text-right space-y-1">
              <p className="font-bold">Contact</p>
              <p>104 Crandon Blvd, Suite 312</p>
              <p>Key Biscayne, FL33149</p>
              <p className="flex items-center justify-center md:justify-end gap-2">
                <Phone className="w-4 h-4" /> +1-(786)-351-1786
              </p>
              <p className="flex items-center justify-center md:justify-end gap-2">
                <Mail className="w-4 h-4" /> info@innovatrials.com
              </p>
              <p className="flex items-center justify-center md:justify-end gap-2">
                <MapPin className="w-4 h-4" /> www.innovatrials.com
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-slate-500 text-xs">
            © {new Date().getFullYear()} Innova Trials. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
