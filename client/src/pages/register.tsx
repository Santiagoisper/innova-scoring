import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSite } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

const registerSchema = z.object({
  siteName: z.string().min(2, "Site name is required"),
  primaryContactName: z.string().min(2, "Primary contact name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(20, "Please provide a brief description of at least 20 characters"),
  location: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
});

type RegisterForm = z.infer<typeof registerSchema>;

const COUNTRIES = [
  "Argentina", "Brazil", "Canada", "Chile", "Colombia", "France", "Germany", "Mexico", "Peru", "Spain", "UK", "USA", "Uruguay"
];

export default function Register() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerSite({
        contactName: data.siteName,
        email: data.email,
        description: `Primary Contact: ${data.primaryContactName}\n${data.description}`,
        location: `${data.location}, ${data.country}`,
        city: data.location,
        country: data.country,
        score: 0,
        token: undefined
      });
      
      setIsSuccess(true);
      toast({
        title: "Registration Submitted",
        description: "Your application has been sent to our administrators for review.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-t-4 border-t-green-600 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registration Successful</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground space-y-4">
              <p>
                Thank you for your interest in partnering with Innova Trials.
              </p>
              <p>
                Our team will review your application. If your site meets our criteria, you will receive an email with your access token and further instructions.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setLocation("/")}>Return to Home</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes regFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(25px, -35px) rotate(90deg) scale(1.08); }
          50% { transform: translate(-15px, -70px) rotate(180deg) scale(0.95); }
          75% { transform: translate(35px, -25px) rotate(270deg) scale(1.05); }
        }
        @keyframes regFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, -25px) rotate(120deg); }
          66% { transform: translate(25px, -50px) rotate(240deg); }
        }
        @keyframes regFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(35px, -45px) scale(1.12) rotate(180deg); }
        }
        @keyframes regPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes regGridFlow {
          0% { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
        @keyframes regWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001965] via-[#00205c] to-slate-900" />

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'regGridFlow 8s linear infinite'
        }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-[6%] left-[4%] w-24 h-24 text-[#005AD2]/15" viewBox="0 0 100 100" style={{ animation: 'regFloat1 18s ease-in-out infinite' }}>
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <circle cx="50" cy="20" r="4" fill="currentColor" />
            <circle cx="76" cy="65" r="4" fill="currentColor" />
            <circle cx="24" cy="65" r="4" fill="currentColor" />
            <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="50" x2="76" y2="65" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="50" x2="24" y2="65" stroke="currentColor" strokeWidth="1" />
          </svg>

          <svg className="absolute top-[10%] right-[6%] w-32 h-32 text-blue-400/10" viewBox="0 0 120 120" style={{ animation: 'regFloat2 22s ease-in-out infinite' }}>
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(0 60 60)" />
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 60 60)" />
            <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 60 60)" />
            <circle cx="60" cy="60" r="6" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-[10%] left-[8%] w-28 h-28 text-[#005AD2]/12" viewBox="0 0 100 100" style={{ animation: 'regFloat3 15s ease-in-out infinite' }}>
            <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 25 L75 38 L75 62 L50 75 L25 62 L25 38 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-[18%] right-[10%] w-20 h-20 text-blue-300/12" viewBox="0 0 80 80" style={{ animation: 'regFloat1 20s ease-in-out infinite reverse' }}>
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

          <svg className="absolute top-[40%] left-[2%] w-16 h-16 text-[#005AD2]/10" viewBox="0 0 60 60" style={{ animation: 'regFloat2 16s ease-in-out infinite' }}>
            <rect x="10" y="10" width="40" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="20" y="20" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="30" r="3" fill="currentColor" />
          </svg>

          <svg className="absolute top-[55%] right-[4%] w-24 h-24 text-blue-300/10" viewBox="0 0 100 100" style={{ animation: 'regFloat3 25s ease-in-out infinite' }}>
            <path d="M30 10 Q50 30 70 30 Q50 50 30 50 Q50 70 70 70 Q50 90 30 90" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M70 10 Q50 30 30 30 Q50 50 70 50 Q50 70 30 70 Q50 90 70 90" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="35" y1="20" x2="65" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="80" x2="65" y2="80" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          </svg>

          <div className="absolute top-[20%] left-[22%] w-3 h-3 rounded-full bg-[#005AD2]/20" style={{ animation: 'regPulse 4s ease-in-out infinite' }} />
          <div className="absolute top-[65%] left-[38%] w-2 h-2 rounded-full bg-blue-400/25" style={{ animation: 'regPulse 3s ease-in-out infinite 1s' }} />
          <div className="absolute top-[30%] right-[28%] w-2.5 h-2.5 rounded-full bg-blue-300/20" style={{ animation: 'regPulse 5s ease-in-out infinite 2s' }} />
          <div className="absolute bottom-[30%] left-[50%] w-2 h-2 rounded-full bg-[#005AD2]/20" style={{ animation: 'regPulse 3.5s ease-in-out infinite 0.5s' }} />

          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-[#005AD2]/30 to-transparent" style={{ animation: 'regWave 6s linear infinite' }} />
          </div>
          <div className="absolute bottom-8 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" style={{ animation: 'regWave 8s linear infinite reverse' }} />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-[#005AD2]" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Site Registration</h1>
            <p className="text-blue-200/70">
              Apply to join our clinical trial network.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white backdrop-blur-xl ring-1 ring-white/20">
            <CardHeader>
              <CardTitle className="text-slate-900">Submit Your Application</CardTitle>
              <CardDescription className="text-slate-500">
                Please provide your site details to apply for our clinical trial network.
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-slate-700">Site Name</Label>
                <Input id="siteName" placeholder="St. Mary Clinical Research Center" {...form.register("siteName")} className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005AD2] focus:ring-[#005AD2]/20" />
                {form.formState.errors.siteName && (
                  <p className="text-xs text-red-400">{form.formState.errors.siteName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactName" className="text-slate-700">Primary Contact Name</Label>
                <Input id="primaryContactName" placeholder="Dr. Jane Smith" {...form.register("primaryContactName")} className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005AD2] focus:ring-[#005AD2]/20" />
                {form.formState.errors.primaryContactName && (
                  <p className="text-xs text-red-400">{form.formState.errors.primaryContactName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <Input id="email" type="email" placeholder="jane.smith@hospital.com" {...form.register("email")} className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005AD2] focus:ring-[#005AD2]/20" />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-700">Country</Label>
                  <Select onValueChange={(val) => form.setValue("country", val)} defaultValue={form.getValues("country")}>
                    <SelectTrigger className="bg-white border-slate-200 text-slate-900 focus:border-[#005AD2] focus:ring-[#005AD2]/20">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country && (
                    <p className="text-xs text-red-400">{form.formState.errors.country.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700">City</Label>
                  <Input id="location" placeholder="e.g. New York" {...form.register("location")} className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005AD2] focus:ring-[#005AD2]/20" />
                  {form.formState.errors.location && (
                    <p className="text-xs text-red-400">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Site Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your facilities, therapeutic areas of expertise, and patient population..." 
                  className="min-h-[120px] bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005AD2] focus:ring-[#005AD2]/20"
                  {...form.register("description")} 
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-400">{form.formState.errors.description.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 text-base bg-gradient-to-r from-[#005AD2] to-[#001965] hover:from-[#0048b0] hover:to-[#001550] text-white font-semibold shadow-lg shadow-[#005AD2]/20 transition-all duration-300" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : "Submit Application"}
              </Button>
            </form>
          </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
