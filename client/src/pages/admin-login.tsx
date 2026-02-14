import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { adminLogin } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const getErrorMessage = (error: unknown): string => {
    const raw = (error as any)?.message;
    if (!raw || typeof raw !== "string") return "Invalid credentials.";
    const firstBrace = raw.indexOf("{");
    if (firstBrace !== -1) {
      try {
        const parsed = JSON.parse(raw.slice(firstBrace));
        if (parsed?.message && typeof parsed.message === "string") {
          return parsed.message;
        }
      } catch {
        // fall through to raw parsing
      }
    }
    const parts = raw.split(": ");
    return parts.length > 1 ? parts.slice(1).join(": ") : raw;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await adminLogin(username, password);
      login({
        id: user.id,
        name: user.name,
        role: "admin",
        permission: user.permission
      });
      toast({
        title: "Admin Access Granted",
        description: `Welcome back, ${user.name}.`,
      });
      setLocation("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: getErrorMessage(error),
      });
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <style>{`
        @keyframes adminGridFlow {
          0% { background-position: 0px 0px; }
          100% { background-position: 60px 60px; }
        }
        @keyframes adminFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(45deg); }
          50% { transform: translate(-15px, -60px) rotate(90deg); }
          75% { transform: translate(25px, -20px) rotate(135deg); }
        }
        @keyframes adminFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-40px, -20px) rotate(60deg) scale(1.1); }
          66% { transform: translate(20px, -50px) rotate(120deg) scale(0.9); }
        }
        @keyframes adminFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.15); }
        }
        @keyframes adminPulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.25; }
        }
        @keyframes hexRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px),
            linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
          animation: 'adminGridFlow 12s linear infinite'
        }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-[5%] left-[5%] w-28 h-28 text-slate-400/10" viewBox="0 0 100 100" style={{ animation: 'adminFloat1 20s ease-in-out infinite' }}>
            <path d="M50 5 L93 27.5 L93 72.5 L50 95 L7 72.5 L7 27.5 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 20 L78 35 L78 65 L50 80 L22 65 L22 35 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path d="M50 35 L64 42.5 L64 57.5 L50 65 L36 57.5 L36 42.5 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.5" />
          </svg>

          <svg className="absolute top-[10%] right-[8%] w-36 h-36 text-blue-400/8" viewBox="0 0 140 140" style={{ animation: 'adminFloat2 25s ease-in-out infinite' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
            <circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="70" cy="70" r="20" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
            <circle cx="70" cy="10" r="3" fill="currentColor" />
            <circle cx="130" cy="70" r="3" fill="currentColor" />
            <circle cx="70" cy="130" r="3" fill="currentColor" />
            <circle cx="10" cy="70" r="3" fill="currentColor" />
            <line x1="70" y1="10" x2="70" y2="130" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
            <line x1="10" y1="70" x2="130" y2="70" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
          </svg>

          <svg className="absolute bottom-[8%] left-[8%] w-32 h-32 text-cyan-400/8" viewBox="0 0 120 120" style={{ animation: 'hexRotate 40s linear infinite' }}>
            <path d="M60 5 L110 30 L110 80 L60 105 L10 80 L10 30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="60" y1="5" x2="60" y2="105" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="10" y1="30" x2="110" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="110" y1="30" x2="10" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          </svg>

          <svg className="absolute bottom-[15%] right-[10%] w-24 h-24 text-indigo-400/10" viewBox="0 0 100 100" style={{ animation: 'adminFloat3 18s ease-in-out infinite' }}>
            <rect x="15" y="15" width="70" height="70" rx="2" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 50 50)" />
            <rect x="25" y="25" width="50" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" transform="rotate(45 50 50)" />
            <rect x="35" y="35" width="30" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="0.6" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="2" fill="currentColor" />
          </svg>

          <svg className="absolute top-[45%] left-[2%] w-20 h-20 text-slate-400/8" viewBox="0 0 80 80" style={{ animation: 'adminFloat1 22s ease-in-out infinite reverse' }}>
            <circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="60" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="55" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="20" cy="60" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <line x1="20" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="0.6" />
            <line x1="20" y1="20" x2="40" y2="55" stroke="currentColor" strokeWidth="0.6" />
            <line x1="60" y1="20" x2="40" y2="55" stroke="currentColor" strokeWidth="0.6" />
            <line x1="20" y1="20" x2="20" y2="60" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
            <line x1="60" y1="20" x2="60" y2="60" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
          </svg>

          <svg className="absolute top-[70%] right-[3%] w-16 h-16 text-teal-400/8" viewBox="0 0 60 60" style={{ animation: 'adminFloat2 16s ease-in-out infinite' }}>
            <path d="M30 5 L55 17.5 L55 42.5 L30 55 L5 42.5 L5 17.5 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="30" cy="30" r="2" fill="currentColor" />
          </svg>

          <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-slate-400/15" style={{ animation: 'adminPulse 4s ease-in-out infinite' }} />
          <div className="absolute top-[65%] left-[45%] w-1.5 h-1.5 rounded-full bg-blue-400/15" style={{ animation: 'adminPulse 3s ease-in-out infinite 1s' }} />
          <div className="absolute top-[30%] right-[25%] w-2 h-2 rounded-full bg-cyan-400/12" style={{ animation: 'adminPulse 5s ease-in-out infinite 2s' }} />
          <div className="absolute bottom-[40%] left-[60%] w-1.5 h-1.5 rounded-full bg-indigo-400/12" style={{ animation: 'adminPulse 3.5s ease-in-out infinite 0.5s' }} />
          <div className="absolute top-[55%] left-[18%] w-1 h-1 rounded-full bg-slate-300/10" style={{ animation: 'adminPulse 4.5s ease-in-out infinite 1.5s' }} />
          <div className="absolute top-[80%] left-[70%] w-1.5 h-1.5 rounded-full bg-teal-400/10" style={{ animation: 'adminPulse 3.2s ease-in-out infinite 0.8s' }} />

          <div className="absolute left-0 right-0 h-[1px] opacity-[0.04]" style={{ animation: 'scanLine 8s linear infinite' }}>
            <div className="h-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-white/40 text-sm font-medium tracking-widest uppercase">Innova Trials LLC</h2>
          </div>
          
          <Card className="border-0 shadow-2xl bg-white/[0.07] backdrop-blur-xl ring-1 ring-white/10">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Admin Portal</CardTitle>
              <CardDescription className="text-slate-400">Secure Management Access</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300/80">Username</Label>
                  <Input 
                    id="username" 
                    data-testid="input-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="bg-white/10 border-white/15 text-white placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300/80">Password</Label>
                  <Input 
                    id="password" 
                    data-testid="input-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="bg-white/10 border-white/15 text-white placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  data-testid="button-admin-login"
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold shadow-lg transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-slate-600 text-xs mt-8">
            Restricted access. Authorized personnel only.
          </p>
        </div>
      </div>
    </Layout>
  );
}
