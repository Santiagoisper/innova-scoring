import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
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
  const { login, sites, consumeToken } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 800));

    const site = sites.find(s => s.email.toLowerCase() === email.toLowerCase() && s.token === token);

    if (site) {
      // Consume token so it cannot be used again
      consumeToken(site.id);
      
      login({
        id: site.id,
        name: site.contactName,
        role: "site",
        siteId: site.id
      });
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      setLocation("/site/disclaimer");
    } else {
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-md">
          {/* Informational Side/Top */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">Participant Login</h1>
            <p className="text-muted-foreground">
              Secure access for authorized clinical research sites.
            </p>
          </div>

          <Card className="border-t-4 border-t-blue-600 shadow-xl">
            <CardHeader>
              <CardTitle>Access Evaluation Portal</CardTitle>
              <CardDescription>
                Enter your registered email and the secure token sent to you by our administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Access Token / Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="token" 
                      type="text" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="INV-XXXXX"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Portal"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground bg-muted/30 p-4">
              <p>Why do we evaluate?</p>
              <p className="text-xs">
                To ensure the highest standards of safety, ethics, and data quality in our clinical trials.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
