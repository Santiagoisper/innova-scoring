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
  contactName: z.string().min(2, "Contact name is required"),
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
        ...data,
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-xl w-full border-t-4 border-t-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-primary">Site Registration</CardTitle>
            <CardDescription>
              Please provide your site details to apply for our clinical trial network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Primary Contact Name</Label>
                <Input id="contactName" placeholder="Dr. Jane Smith" {...form.register("contactName")} />
                {form.formState.errors.contactName && (
                  <p className="text-xs text-destructive">{form.formState.errors.contactName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane.smith@hospital.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select onValueChange={(val) => form.setValue("country", val)} defaultValue={form.getValues("country")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country && (
                    <p className="text-xs text-destructive">{form.formState.errors.country.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">City</Label>
                  <Input id="location" placeholder="e.g. New York" {...form.register("location")} />
                  {form.formState.errors.location && (
                    <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your facilities, therapeutic areas of expertise, and patient population..." 
                  className="min-h-[120px]"
                  {...form.register("description")} 
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={form.formState.isSubmitting}>
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
    </Layout>
  );
}
