import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex-1 grid md:grid-cols-2 min-h-[calc(100vh-64px)]">
        {/* Client / Site Section */}
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
               style={{ backgroundImage: 'url("/images/lab-hero.jpg")' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70" />
          
          <div className="relative h-full flex flex-col justify-center items-start p-12 text-white z-10">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg mb-6 border border-white/20">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Clinical Research Sites
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-md leading-relaxed">
              Join our network of excellence. Register your site to participate in groundbreaking clinical trials and advance medical science.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-blue-50 border-0 font-semibold"
                onClick={() => setLocation("/register")}
              >
                Register New Site
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10 hover:text-white"
                onClick={() => setLocation("/login/site")}
              >
                Site Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Administrator Section */}
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
               style={{ backgroundImage: 'url("/images/admin-hero-new.jpg")' }} />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 to-slate-800/70" />
          
          <div className="relative h-full flex flex-col justify-center items-end p-12 text-white z-10 text-right">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg mb-6 border border-white/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Administration
            </h2>
            <p className="text-lg text-slate-100 mb-8 max-w-md leading-relaxed">
              Innova Trials management portal. Review applications, monitor site performance, and manage clinical trial compliance.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-50 border-0 font-semibold"
              onClick={() => setLocation("/login/admin")}
            >
              Access Portal <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Info Footer - Only on Home */}
      <div className="bg-slate-50 border-t py-12 text-center text-sm text-muted-foreground">
        <div className="container mx-auto space-y-6">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Contact Information</h3>
            <p className="text-base">104 Crandon Blvd, Suite 312</p>
            <p className="text-base">Key Biscayne, FL 33149</p>
            <p className="text-base font-medium mt-2">+1-(786)-351-1786</p>
            <p className="text-base text-primary hover:underline"><a href="mailto:info@innovatrials.com">info@innovatrials.com</a></p>
            <p className="text-base text-primary hover:underline"><a href="https://www.innovatrials.com" target="_blank" rel="noopener noreferrer">www.innovatrials.com</a></p>
          </div>
          
          <div className="pt-8 border-t border-slate-200 w-full max-w-2xl mx-auto">
            <p>© 2026 Innova Trials LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
