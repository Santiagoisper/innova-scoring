import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchQuestions, submitEvaluation as submitEvaluationApi } from "@/lib/api";
import { calculateScore } from "@/lib/questions";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Upload, FileText, X, Check, XCircle } from "lucide-react";

export default function SiteEvaluation() {
  const { user } = useStore();
  const { data: questions = [], isLoading } = useQuery({ queryKey: ["/api/questions"], queryFn: fetchQuestions });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [attachments, setAttachments] = useState<Record<string, File[]>>({});
  
  const form = useForm();

  if (!user || user.role !== "site" || !user.siteId) {
    return <div>Unauthorized</div>;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const activeQuestions = questions.filter((q: any) => q.enabled !== false);

  const handleFileChange = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const invalidFiles: File[] = [];
      
      const validExtensions = ['jpg', 'jpeg', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
      
      files.forEach(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (validExtensions.includes(extension || "")) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid File Type",
          description: `Skipped ${invalidFiles.length} file(s). Please upload JPG, Excel, Word, or TXT files only.`,
          variant: "destructive"
        });
      }

      if (validFiles.length > 0) {
        setAttachments(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), ...validFiles]
        }));
      }
      
      e.target.value = '';
    }
  };

  const removeFile = (questionId: string, index: number) => {
    setAttachments(prev => {
      const currentFiles = prev[questionId] || [];
      const newFiles = [...currentFiles];
      newFiles.splice(index, 1);
      
      if (newFiles.length === 0) {
        const newAttachments = { ...prev };
        delete newAttachments[questionId];
        return newAttachments;
      }
      
      return {
        ...prev,
        [questionId]: newFiles
      };
    });
  };

  const onSubmit = async (data: any) => {
    const richAnswers: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (key.endsWith("_details")) return;
      const detailsKey = `${key}_details`;
      const details = data[detailsKey] || undefined;
      richAnswers[key] = {
        value: data[key],
        details: details,
        attachment: attachments[key] ? attachments[key].map(f => ({
          name: f.name,
          type: f.type,
          size: f.size
        })) : undefined
      };
    });

    let score = 0;
    let status: string = "Completed";
    if (typeof calculateScore === 'function') {
      const questionsList = (questions ?? []).map((q) => ({
        ...q,
        type: (q.type === "YesNo" || q.type === "Text" || q.type === "Select" ? q.type : "YesNo") as "YesNo" | "Text" | "Select",
        isKnockOut: q.isKnockOut ?? false,
        enabled: q.enabled ?? true,
        keywords: q.keywords ?? undefined,
      }));
      const result = calculateScore(richAnswers, questionsList);
      score = result.score;
      if (result.status === "Approved") {
        status = "Approved";
      } else if (result.status === "Conditional") {
        status = "ToConsider";
      } else {
        status = "Rejected";
      }
    }

    try {
      await submitEvaluationApi(user.siteId!, { answers: richAnswers, score, status });
      setIsSubmitted(true);
      toast({
        title: "Evaluation Submitted",
        description: "Your responses have been recorded.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An error occurred.",
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

  const categories: string[] = Array.from(new Set(activeQuestions.map((q: any) => q.category as string)));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-primary">Site Evaluation</h1>
          <p className="text-muted-foreground">Please answer all questions truthfully.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {categories.map((category: string) => (
            <Card key={category} className="shadow-md">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-xl">{category as string}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {activeQuestions.filter((q: any) => q.category === category).map((q: any, idx: number) => (
                  <div key={q.id} className="space-y-3">
                    <Label className="text-sm font-medium text-justify block leading-relaxed pr-4">
                      {idx + 1}. {q.text} {q.isKnockOut && <span className="text-destructive">*</span>}
                    </Label>
                    
                    <Controller
                      name={q.id}
                      control={form.control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <div className="space-y-3">
                          {q.type === "YesNo" ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3" data-testid={`yesno-${q.id}`}>
                                <button
                                  type="button"
                                  onClick={() => field.onChange("Yes")}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                                    field.value === "Yes"
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                  data-testid={`btn-yes-${q.id}`}
                                >
                                  <Check className={`h-4 w-4 ${field.value === "Yes" ? "text-emerald-600" : "text-gray-400"}`} />
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange("No")}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                                    field.value === "No"
                                      ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                  data-testid={`btn-no-${q.id}`}
                                >
                                  <XCircle className={`h-4 w-4 ${field.value === "No" ? "text-red-500" : "text-gray-400"}`} />
                                  No
                                </button>
                              </div>
                              <Controller
                                name={`${q.id}_details`}
                                control={form.control}
                                render={({ field: detailsField }) => (
                                  <Textarea
                                    placeholder={field.value === "Yes" ? "Please provide additional details..." : "Select 'Yes' to add details"}
                                    className={`resize-none transition-all ${field.value !== "Yes" ? "opacity-50 bg-muted cursor-not-allowed" : ""}`}
                                    disabled={field.value !== "Yes"}
                                    {...detailsField}
                                    data-testid={`details-${q.id}`}
                                  />
                                )}
                              />
                            </div>
                          ) : (
                            <Textarea 
                              placeholder="Please provide details..." 
                              className="resize-none" 
                              {...field} 
                            />
                          )}
                        </div>
                      )}
                    />
                    
                    <div className="mt-2">
                       <Label htmlFor={`file-${q.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                         Attach supporting document (JPG, Excel, Word, TXT)
                       </Label>
                       
                       <div className="flex flex-col gap-2">
                         <Input 
                           id={`file-${q.id}`}
                           type="file" 
                           className="h-9 text-xs max-w-sm cursor-pointer file:cursor-pointer"
                           accept=".jpg,.jpeg,.xls,.xlsx,.doc,.docx,.txt"
                           multiple
                           onChange={(e) => handleFileChange(q.id, e)}
                         />
                         
                         {attachments[q.id] && attachments[q.id].length > 0 && (
                           <div className="flex flex-col gap-2 mt-1">
                             {attachments[q.id].map((file, fileIdx) => (
                               <div key={fileIdx} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border max-w-sm">
                                 <FileText className="h-4 w-4 text-primary shrink-0" />
                                 <span className="text-sm truncate flex-1">{file.name}</span>
                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                   onClick={() => removeFile(q.id, fileIdx)}
                                 >
                                   <X className="h-4 w-4" />
                                 </Button>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                    </div>

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
