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
        description: "Invalid credentials.",
      });
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-900">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <img src="/images/innova-logo.png" alt="Innova Trials" className="h-16 w-16 object-contain brightness-0 invert" data-testid="img-logo-admin-login" />
          </div>
          
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>Innova Trials Management</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin"
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-slate-500 text-xs mt-8">
            Restricted access. Authorized personnel only.
          </p>
        </div>
      </div>
    </Layout>
  );
}
