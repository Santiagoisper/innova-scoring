"use client"

import Link from 'next/link'
import { Building2, ShieldCheck, BarChart3, Users, ArrowRight, Sparkles, Phone, Mail, MapPin } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Innova Trials</h1>
                <p className="text-xs text-slate-500">Site Scoring Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/cliente" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Client Portal
              </Link>
              <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10">
                Admin Access
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">Clinical Research Excellence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Evaluate Research Sites
              <span className="block text-blue-600">with Precision</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              A comprehensive platform for clinical research organizations to assess, 
              score, and benchmark investigational sites across key criteria.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/cliente"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                <Building2 className="w-5 h-5" />
                Client Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/admin"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Access
              </Link>
            </div>
          </div>

          {/* Real Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { label: 'Criteria Evaluated', value: '18' },
              { label: 'Categories', value: '5' },
              { label: 'Maturity Levels', value: '5' },
              { label: 'Weighted Scoring', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Intelligence</h2>
            <p className="text-slate-600">Our platform provides the tools necessary for high-stakes site selection.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Weighted Scoring</h3>
              <p className="text-slate-600 leading-relaxed">Advanced mathematical models that weight each criterion based on its impact on study success.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Site Portal</h3>
              <p className="text-slate-600 leading-relaxed">Direct access for research sites to provide their data, ensuring accuracy and reducing CRO workload.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Maturity Levels</h3>
              <p className="text-slate-600 leading-relaxed">A 5-level maturity model that classifies sites from 'Initial' to 'Optimized' for better benchmarking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Innova Trials</h2>
              </div>
              <p className="text-slate-400 max-w-sm mb-8">
                The global standard for research site intelligence and performance scoring.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-6 text-blue-400">Contact Information</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                  <p>104 Crandon Blvd, Suite 312<br />Key Biscayne, FL 33149</p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                  <p>+1-(786)-351-1786</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <p>info@innovatrials.com</p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
                  <a href="https://www.innovatrials.com" target="_blank" className="hover:text-white transition-colors">www.innovatrials.com</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Innova Trials. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
