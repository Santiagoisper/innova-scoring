import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { ArrowRight, BarChart3, Globe2, ShieldCheck, Mail, MapPin, CheckCircle2, LayoutDashboard, Shield } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: stats } = useQuery({ queryKey: ["/api/stats"], queryFn: fetchStats });

  const activeQuestionsCount = stats?.activeQuestions ?? stats?.activeQuestionsCount ?? 0;
  const activeCategoriesCount = stats?.categories ?? stats?.activeCategoriesCount ?? 0;

  return (
    <Layout>
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Hero Section */}
        <section className="pt-12 pb-24 px-4 text-center bg-white relative overflow-hidden">
          <style>{`
            @keyframes heroFloat {
              0% { transform: scale(1.1) translate(0, 0) rotate(0deg); }
              20% { transform: scale(1.15) translate(-20px, -15px) rotate(0.5deg); }
              40% { transform: scale(1.1) translate(15px, -20px) rotate(-0.5deg); }
              60% { transform: scale(1.2) translate(-10px, 10px) rotate(0.3deg); }
              80% { transform: scale(1.15) translate(20px, -5px) rotate(-0.3deg); }
              100% { transform: scale(1.1) translate(0, 0) rotate(0deg); }
            }
            @keyframes heroPulse {
              0%, 100% { opacity: 0.75; }
              50% { opacity: 0.9; }
            }
          `}</style>
          <div 
            className="absolute -inset-20 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/images/hero-bg.png')",
              animation: "heroFloat 12s ease-in-out infinite, heroPulse 6s ease-in-out infinite"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/40 to-white/90" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              CLINICAL RESEARCH EXCELLENCE
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Evaluate Research Sites<br/>
              <span className="text-blue-600">with Precision</span>
            </h1>
            
            <p className="text-xl text-slate-800 font-medium mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              A comprehensive platform for clinical research organizations to assess, score, and benchmark investigational sites across key criteria.
            </p>
            
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white h-14 px-10 text-base rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 border border-blue-400/20 overflow-hidden group"
                  onClick={() => setLocation("/login/site")}
                  data-testid="button-client-portal"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <LayoutDashboard className="mr-2 h-5 w-5" /> Client Portal <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  className="relative h-14 px-10 text-base rounded-full border-2 border-slate-700 text-slate-800 bg-white/70 backdrop-blur-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 overflow-hidden group"
                  onClick={() => setLocation("/login/admin")}
                  data-testid="button-admin-access"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <ShieldCheck className="mr-2 h-5 w-5" /> Admin Access
                </Button>
              </div>
              <Button 
                size="lg" 
                variant="ghost"
                className="relative h-12 px-8 text-base rounded-full text-blue-700 hover:text-blue-800 hover:bg-blue-50/80 transition-all duration-300 group"
                onClick={() => setLocation("/register")}
                data-testid="button-register-site"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Register Site <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "CRITERIA EVALUATED", value: activeQuestionsCount },
                { label: "CATEGORIES", value: activeCategoriesCount },
                { label: "MATURITY LEVELS", value: "5" },
                { label: "WEIGHTED SCORING", value: "100%" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Intelligence Section */}
        <section className="py-24 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Intelligence</h2>
              <p className="text-slate-500 text-lg">Our platform provides the tools necessary for high-stakes site selection.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
                  title: "Weighted Scoring",
                  desc: "Advanced mathematical models that weight each criterion based on its impact on study success."
                },
                {
                  icon: <Globe2 className="h-6 w-6 text-blue-600" />,
                  title: "Site Portal",
                  desc: "Direct access for research sites to provide their data, ensuring accuracy and reducing CRO workload."
                },
                {
                  icon: <Shield className="h-6 w-6 text-blue-600" />,
                  title: "Maturity Levels",
                  desc: "A 5-level maturity model that classifies sites from 'Initial' to 'Optimized' for better benchmarking."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Footer (Matches Screenshot) */}
        <footer className="bg-[#0f172a] text-white py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
              {/* Left Column */}
              <div>
                <div className="mb-6">
                  <span className="font-heading font-bold text-xl tracking-tight text-white">Innova Trials LLC</span>
                </div>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                  The global standard for research site intelligence and performance scoring.
                </p>
              </div>

              {/* Right Column (Contact Box) */}
              <div className="bg-[#1e293b] rounded-2xl p-8 border border-slate-700/50">
                <h3 className="text-blue-400 font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-slate-300">
                    <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p>104 Crandon Blvd, Suite 312</p>
                      <p>Key Biscayne, FL 33149</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="h-5 w-5 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-xs">📞</span>
                    </div>
                    <p>+1-(786)-351-1786</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                    <a href="mailto:info@innovatrials.com" className="hover:text-white transition-colors">info@innovatrials.com</a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <ArrowRight className="h-5 w-5 text-blue-500 shrink-0" />
                    <a href="https://www.innovatrials.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.innovatrials.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
              <p className="mb-2">© 2026 Innova Trials. All rights reserved.</p>
              <p className="text-xs opacity-60">V.1 | By Santiago Isbert Perlender, member of Innova Trials Team</p>
            </div>
          </div>
        </footer>

      </div>
    </Layout>
  );
}
