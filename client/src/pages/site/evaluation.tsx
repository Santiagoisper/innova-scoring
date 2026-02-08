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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Upload, FileText, X } from "lucide-react";

export default function SiteEvaluation() {
  const { user, submitEvaluation, questions } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Local state to store files before submission
  // Key: questionId, Value: File object
  const [attachments, setAttachments] = useState<Record<string, File>>({});
  
  const form = useForm();

  if (!user || user.role !== "site") {
    return <div>Unauthorized</div>;
  }

  // Filter only enabled questions
  const activeQuestions = questions.filter(q => q.enabled !== false);

  const handleFileChange = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validation for file types (jpg, excel, word, txt)
      const validTypes = [
        "image/jpeg", 
        "image/jpg", 
        "application/vnd.ms-excel", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "text/plain"
      ];
      
      // Allow if type matches or if it's an excel/word file (sometimes mime types vary)
      // Basic check on extension for safety in mock
      const extension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
      
      if (validExtensions.includes(extension || "")) {
        setAttachments(prev => ({
          ...prev,
          [questionId]: file
        }));
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload JPG, Excel, Word, or TXT files only.",
          variant: "destructive"
        });
      }
    }
  };

  const removeFile = (questionId: string) => {
    setAttachments(prev => {
      const newAttachments = { ...prev };
      delete newAttachments[questionId];
      return newAttachments;
    });
  };

  const onSubmit = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Merge data with attachments metadata
    // In a real app, we would upload files here and get URLs back
    const processedData = { ...data };
    
    // We need to structure the data to match the expected format in store (if store expects it)
    // Actually, submitEvaluation takes answers record. 
    // The current store implementation expects just a value string or the raw form data?
    // Let's check store.ts implementation. 
    // submitEvaluation: (siteId, answers) => ...
    // answers is Record<string, any>
    
    // We need to inject the attachment info into the answers
    const finalAnswers: Record<string, any> = {};
    
    Object.keys(data).forEach(key => {
      finalAnswers[key] = {
        value: data[key],
        attachment: attachments[key] ? {
          name: attachments[key].name,
          type: attachments[key].type,
          size: attachments[key].size
        } : undefined
      };
    });
    
    if (user.siteId) {
      // We pass the raw data form structure combined with attachment info
      // The store's calculateScore might need adjustment if it expects direct values, 
      // but let's check store.ts first. 
      // It currently does: const answer = answers[q.id];
      // If we change the structure of answers passed to submitEvaluation, we might break calculateScore.
      
      // Wait! The store logic currently takes `answers` as a Record<string, any>.
      // In `calculateScore`, it accesses `answers[q.id]`.
      // If `answers` comes from `react-hook-form`, it is just `{ questionId: "Yes" }`.
      
      // I should modify `submitEvaluation` in the store to handle the new structure 
      // OR pass a separate attachments object? 
      // Or better, I'll pass the enriched object and update the store to handle it.
      
      // Let's modify `submitEvaluation` call to include attachments separately or merged.
      // But `calculateScore` expects `answers[q.id]` to be the value string.
      
      // Let's just pass the form data as is for now to calculateScore, 
      // but for the SITE object update, we want to store the attachment info.
      
      // The current store implementation:
      // submitEvaluation: (siteId, answers) => set((state) => {
      //   const result = calculateScore(answers, state.questions);
      //   ...
      //   return { sites: ... answers: answers as any ... }
      // })
      
      // So `answers` is stored directly. 
      // If I change `answers` to be `{ value: "Yes", attachment: ... }`, `calculateScore` breaks.
      
      // Solution: Pass `answers` as `{ [qId]: "Yes" }` (value only) to `calculateScore`? 
      // No, `calculateScore` is inside the store.
      
      // I will handle this inside `onSubmit` by constructing a special object that works for both or
      // pass a special structure that the store can handle if I modify the store.
      // But I can't modify the store call signature easily without checking everywhere.
      
      // Actually, looking at `calculateScore` in `questions.ts`:
      // `const answer = answers[q.id];`
      // It expects a string.
      
      // So if I pass objects, it breaks.
      
      // I will pass the plain values to `submitEvaluation`. 
      // But I also want to save the attachments.
      // I'll update the store to accept an optional `attachments` parameter? 
      // Or I'll verify if I can just pass the plain values and somehow merge attachments later.
      
      // Let's stick to the plan: modify the store logic to accept the richer structure 
      // OR modify `calculateScore` to handle objects.
      
      // I'll modify `onSubmit` to pass a structure that contains values AND attachments.
      // BUT `submitEvaluation` takes `answers: Record<string, any>`.
      
      // Let's pass:
      // answers = { q1: "Yes", q2: "No" ... }
      // AND attachments = { q1: { name: "file.jpg" ... } }
      
      // Wait, `submitEvaluation` signature in store is:
      // submitEvaluation: (siteId: string, answers: Record<string, any>) => void;
      
      // I will override the `answers` in the store with the combined data.
      // So I need to update `submitEvaluation` in `store.ts` to handle this new structure
      // OR I update `calculateScore` to extract the value if it receives an object.
      
      // Updating `calculateScore` seems safer and more robust.
      
      // For now in `onSubmit`, I'll prepare the data properly.
      
      const answersPayload: Record<string, any> = {};
      Object.keys(data).forEach(k => {
        answersPayload[k] = data[k];
      });
      
      // We need to pass the attachments too. 
      // Since I can't easily change the store signature right now without multiple file edits,
      // I'll pass the attachments IN the answers object as a special property if possible,
      // OR I'll modify the store to expect `{ value, attachment }` and update `calculateScore`.
      
      // Let's go with updating `calculateScore` to be smart.
      
      const richAnswers: Record<string, any> = {};
       Object.keys(data).forEach(key => {
        richAnswers[key] = {
          value: data[key],
          attachment: attachments[key] ? {
            name: attachments[key].name,
            type: attachments[key].type,
            size: attachments[key].size
          } : undefined
        };
      });

      submitEvaluation(user.siteId, richAnswers);
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
                          )}
                        </div>
                      )}
                    />
                    
                    {/* File Upload Section */}
                    <div className="mt-2">
                       <Label htmlFor={`file-${q.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                         Attach supporting document (JPG, Excel, Word, TXT)
                       </Label>
                       
                       {!attachments[q.id] ? (
                         <div className="flex items-center gap-2">
                           <Input 
                             id={`file-${q.id}`}
                             type="file" 
                             className="h-9 text-xs max-w-sm cursor-pointer file:cursor-pointer"
                             accept=".jpg,.jpeg,.xls,.xlsx,.doc,.docx,.txt"
                             onChange={(e) => handleFileChange(q.id, e)}
                           />
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border max-w-sm">
                           <FileText className="h-4 w-4 text-primary" />
                           <span className="text-sm truncate flex-1">{attachments[q.id].name}</span>
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="icon" 
                             className="h-6 w-6 text-muted-foreground hover:text-destructive"
                             onClick={() => removeFile(q.id)}
                           >
                             <X className="h-4 w-4" />
                           </Button>
                         </div>
                       )}
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
