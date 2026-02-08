import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { scoringSchema, calculateScore, type ScoringInput } from "@/lib/scoring";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ScoringInput>({
    resolver: zodResolver(scoringSchema),
    defaultValues: {
      fullName: "",
      dni: "",
      age: 25,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      employmentStatus: "employed",
      loanAmount: 1000,
    },
  });

  const onSubmit = async (data: ScoringInput) => {
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const result = calculateScore(data);
    
    // Store in local storage for "history" simulation
    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: data.fullName,
      result
    };
    
    const existingHistory = JSON.parse(localStorage.getItem("innova_history") || "[]");
    localStorage.setItem("innova_history", JSON.stringify([historyItem, ...existingHistory]));

    toast({
      title: "Assessment Complete",
      description: "Redirecting to results...",
    });

    setLocation(`/result/${historyItem.id}`);
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["fullName", "dni", "age"] as const
      : ["monthlyIncome", "monthlyExpenses", "employmentStatus", "loanAmount"] as const;

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2 text-center mb-8">
          <h2 className="text-3xl font-display font-bold tracking-tight">New Credit Assessment</h2>
          <p className="text-muted-foreground">Complete the form below to calculate the credit score and risk profile.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle>{step === 1 ? "Personal Information" : step === 2 ? "Financial Details" : "Review & Submit"}</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter basic applicant details." : step === 2 ? "Provide income and employment information." : "Verify the information before processing."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="grid gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" {...form.register("fullName")} />
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dni">ID / DNI</Label>
                      <Input id="dni" placeholder="12345678" {...form.register("dni")} />
                      {form.formState.errors.dni && (
                        <p className="text-xs text-destructive">{form.formState.errors.dni.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input type="number" id="age" {...form.register("age", { valueAsNumber: true })} />
                      {form.formState.errors.age && (
                        <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Financial */}
              {step === 2 && (
                <div className="grid gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                      <Input type="number" id="monthlyIncome" {...form.register("monthlyIncome", { valueAsNumber: true })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                      <Input type="number" id="monthlyExpenses" {...form.register("monthlyExpenses", { valueAsNumber: true })} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select onValueChange={(val: any) => form.setValue("employmentStatus", val)} defaultValue={form.getValues("employmentStatus")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed (Full-time)</SelectItem>
                        <SelectItem value="self-employed">Self-Employed / Freelance</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="loanAmount">Requested Loan Amount ($)</Label>
                    <Input type="number" id="loanAmount" className="text-lg font-semibold" {...form.register("loanAmount", { valueAsNumber: true })} />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Applicant:</span>
                      <span className="font-medium text-right">{form.getValues("fullName")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">ID/DNI:</span>
                      <span className="font-medium text-right">{form.getValues("dni")}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Net Income:</span>
                      <span className="font-medium text-right text-emerald-600">
                        ${(form.getValues("monthlyIncome") - form.getValues("monthlyExpenses")).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Requested Loan:</span>
                      <span className="font-bold text-right">${form.getValues("loanAmount").toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 rounded-md border border-primary/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Ready to process assessment.</span>
                  </div>
                </div>
              )}

              <CardFooter className="px-0 pt-4 flex justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : <div />}
                
                {step < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Calculate Score
                  </Button>
                )}
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
