import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { siteLogin } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound } from "lucide-react";

export default function SiteLogin() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await siteLogin(email, token);
      login({
        id: result.id,
        name: result.name,
        role: "site",
        siteId: result.siteId || result.id,
        email: email,
      });
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      setLocation("/site/disclaimer");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
        description: "Please check your email and access token.",
      });
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <style>{`
        @keyframes siteFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(30px, -40px) rotate(90deg) scale(1.1); }
          50% { transform: translate(-20px, -80px) rotate(180deg) scale(0.95); }
          75% { transform: translate(40px, -30px) rotate(270deg) scale(1.05); }
        }
        @keyframes siteFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-50px, -30px) rotate(120deg); }
          66% { transform: translate(30px, -60px) rotate(240deg); }
        }
        @keyframes siteFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(40px, -50px) scale(1.15) rotate(180deg); }
        }
        @keyframes sitePulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes dnaRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gridFlow {
          0% { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
        @keyframes waveMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'gridFlow 8s linear infinite'
        }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-[8%] left-[5%] w-24 h-24 text-cyan-400/15" viewBox="0 0 100 100" style={{ animation: 'siteFloat1 18s ease-in-out infinite' }}>
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <circle cx="50" cy="20" r="4" fill="currentColor" />
            <circle cx="76" cy="65" r="4" fill="currentColor" />
            <circle cx="24" cy="65" r="4" fill="currentColor" />
            <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="50" x2="76" y2="65" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="50" x2="24" y2="65" stroke="currentColor" strokeWidth="1" />
          </svg>

          <svg className="absolute top-[15%] right-[8%] w-32 h-32 text-blue-400/10" viewBox="0 0 120 120" style={{ animation: 'siteFloat2 22s ease-in-out infinite' }}>
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(0 60 60)" />
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 60 60)" />
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 60 60)" />
            <circle cx="60" cy="60" r="6" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-[12%] left-[10%] w-28 h-28 text-indigo-400/12" viewBox="0 0 100 100" style={{ animation: 'siteFloat3 15s ease-in-out infinite' }}>
            <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 25 L75 38 L75 62 L50 75 L25 62 L25 38 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-[20%] right-[12%] w-20 h-20 text-teal-400/12" viewBox="0 0 80 80" style={{ animation: 'siteFloat1 20s ease-in-out infinite reverse' }}>
            <path d="M40 5 L40 75" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="40" cy="15" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="35" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="55" cy="25" r="4" fill="currentColor" opacity="0.5" />
            <circle cx="25" cy="45" r="4" fill="currentColor" opacity="0.5" />
            <circle cx="55" cy="65" r="4" fill="currentColor" opacity="0.5" />
            <line x1="40" y1="15" x2="55" y2="25" stroke="currentColor" strokeWidth="0.8" />
            <line x1="40" y1="35" x2="25" y2="45" stroke="currentColor" strokeWidth="0.8" />
            <line x1="40" y1="55" x2="55" y2="65" stroke="currentColor" strokeWidth="0.8" />
          </svg>

          <svg className="absolute top-[45%] left-[3%] w-16 h-16 text-purple-400/10" viewBox="0 0 60 60" style={{ animation: 'siteFloat2 16s ease-in-out infinite' }}>
            <rect x="10" y="10" width="40" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="20" y="20" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="30" r="3" fill="currentColor" />
          </svg>

          <svg className="absolute top-[60%] right-[5%] w-24 h-24 text-cyan-300/10" viewBox="0 0 100 100" style={{ animation: 'dnaRotate 30s linear infinite' }}>
            <path d="M30 10 Q50 30 70 30 Q50 50 30 50 Q50 70 70 70 Q50 90 30 90" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M70 10 Q50 30 30 30 Q50 50 70 50 Q50 70 30 70 Q50 90 70 90" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="35" y1="20" x2="65" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="80" x2="65" y2="80" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          </svg>

          <div className="absolute top-[25%] left-[25%] w-3 h-3 rounded-full bg-cyan-400/20" style={{ animation: 'sitePulse 4s ease-in-out infinite' }} />
          <div className="absolute top-[70%] left-[40%] w-2 h-2 rounded-full bg-blue-400/25" style={{ animation: 'sitePulse 3s ease-in-out infinite 1s' }} />
          <div className="absolute top-[35%] right-[30%] w-2.5 h-2.5 rounded-full bg-indigo-400/20" style={{ animation: 'sitePulse 5s ease-in-out infinite 2s' }} />
          <div className="absolute bottom-[35%] left-[55%] w-2 h-2 rounded-full bg-teal-400/20" style={{ animation: 'sitePulse 3.5s ease-in-out infinite 0.5s' }} />
          <div className="absolute top-[50%] right-[45%] w-1.5 h-1.5 rounded-full bg-purple-400/15" style={{ animation: 'sitePulse 4.5s ease-in-out infinite 1.5s' }} />

          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" style={{ animation: 'waveMove 6s linear infinite' }} />
          </div>
          <div className="absolute bottom-8 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" style={{ animation: 'waveMove 8s linear infinite reverse' }} />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <KeyRound className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Participant Login</h1>
            <p className="text-blue-200/70">
              Secure access for authorized clinical research sites.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/[0.07] backdrop-blur-xl border-white/10 ring-1 ring-white/10">
            <CardHeader>
              <CardTitle className="text-white">Access Evaluation Portal</CardTitle>
              <CardDescription className="text-blue-200/60">
                Enter your registered email and the secure token sent to you by our administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-100/80">Email Address</Label>
                  <Input 
                    id="email" 
                    data-testid="input-email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-blue-100/80">Access Token / Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-blue-300/50" />
                    <Input 
                      id="token" 
                      data-testid="input-token"
                      type="text" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="INV-XXXXX"
                      className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  data-testid="button-login"
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Portal"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-blue-200/50 border-t border-white/5 p-4">
              <p>Why do we evaluate?</p>
              <p className="text-xs text-blue-200/40">
                To ensure the highest standards of safety, ethics, and data quality in our clinical trials.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
