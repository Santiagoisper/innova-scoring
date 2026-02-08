import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function SiteEvaluation() {
  const { user, submitEvaluation, questions } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm();

  if (!user || user.role !== "site") {
    return <div>Unauthorized</div>;
  }

  // Filter only enabled questions
  const activeQuestions = questions.filter(q => q.enabled !== false);

  const onSubmit = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (user.siteId) {
      submitEvaluation(user.siteId, data);
      setIsSubmitted(true);
      toast({
        title: "Evaluation Submitted",
        description: "Your responses have been recorded.",
      });
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-t-4 border-t-green-600 shadow-lg animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Evaluation Complete</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground space-y-4">
              <p>
                Thank you for completing the site evaluation questionnaire.
              </p>
              <p>
                Our team will review your responses and update your site status accordingly. You can check back later for the final decision.
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

  // Group questions by category
  const categories = Array.from(new Set(activeQuestions.map(q => q.category)));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-primary">Site Evaluation</h1>
          <p className="text-muted-foreground">Please answer all questions truthfully.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {categories.map(category => (
            <Card key={category} className="shadow-md">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-xl">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {activeQuestions.filter(q => q.category === category).map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {idx + 1}. {q.text} {q.isKnockOut && <span className="text-destructive">*</span>}
                    </Label>
                    
                    <Controller
                      name={q.id}
                      control={form.control}
                      rules={{ required: "This question is required" }}
                      render={({ field }) => (
                        q.type === "YesNo" ? (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id={`${q.id}-yes`} />
                              <Label htmlFor={`${q.id}-yes`} className="font-normal cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id={`${q.id}-no`} />
                              <Label htmlFor={`${q.id}-no`} className="font-normal cursor-pointer">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NA" id={`${q.id}-na`} />
                              <Label htmlFor={`${q.id}-na`} className="font-normal cursor-pointer">N/A</Label>
                            </div>
                          </RadioGroup>
                        ) : (
                          <Textarea 
                            placeholder="Please provide details..." 
                            className="resize-none" 
                            {...field} 
                          />
                        )
                      )}
                    />
                    {form.formState.errors[q.id] && (
                      <p className="text-xs text-destructive">Required</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-4 pb-12">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : "Submit Evaluation"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
