import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchQuestions, fetchSites, createQuestion, deleteQuestion as deleteQuestionApi, bulkUpdateQuestions } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Save, Loader2, ShieldAlert, CheckCircle, MessageSquareText, ListChecks, ChevronDown, ChevronUp, GripVertical, Zap, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Question } from "@/lib/types";
import { DEFAULT_SCORING_CONFIG, calculateScore, loadScoringModelConfig, saveScoringModelConfig, type ScoringModelConfig } from "@/lib/questions";

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  "Infrastructure": { icon: "🏗️", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "Staff": { icon: "👥", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  "Quality": { icon: "✅", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Regulatory": { icon: "📋", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  "Experience": { icon: "🔬", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  "Technology": { icon: "💻", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200" },
  "Capacity": { icon: "📊", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
};

const getConfig = (category: string) => CATEGORY_CONFIG[category] || { icon: "📌", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" };

const TypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case "YesNo":
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          <CheckCircle className="h-3 w-3" />
          Yes / No
        </div>
      );
    case "Text":
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          <MessageSquareText className="h-3 w-3" />
          Free Text
        </div>
      );
    case "Select":
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
          <ListChecks className="h-3 w-3" />
          Select
        </div>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export default function EvaluationSetup() {
  const { user } = useStore();
  const { data: questions = [], isLoading } = useQuery({ queryKey: ["/api/questions"], queryFn: fetchQuestions, refetchInterval: 15000 });
  const { data: sites = [] } = useQuery({ queryKey: ["/api/sites"], queryFn: fetchSites, refetchInterval: 15000 });
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [faqOpen, setFaqOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const prevQuestionsRef = useRef<string>("");

  const normalizeQuestion = (q: any, index: number): Question => ({
    id: String(q?.id ?? `q-${index}`),
    text: String(q?.text ?? ""),
    type: q?.type === "YesNo" || q?.type === "Text" || q?.type === "Select" ? q.type : "YesNo",
    category: String(q?.category ?? "Uncategorized"),
    weight: Number.isFinite(Number(q?.weight)) ? Number(q.weight) : 0,
    isKnockOut: Boolean(q?.isKnockOut),
    enabled: q?.enabled !== false,
    keywords: Array.isArray(q?.keywords) ? q.keywords.filter((k: any) => typeof k === "string") : [],
  });

  useEffect(() => {
    const questionsJson = JSON.stringify(questions);
    if (questionsJson !== prevQuestionsRef.current) {
      prevQuestionsRef.current = questionsJson;
      const safeQuestions = Array.isArray(questions) ? questions.map(normalizeQuestion) : [];
      setLocalQuestions(safeQuestions);
      setHasChanges(false);
    }
  }, [questions]);
  
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: "",
    type: "YesNo",
    category: "Infrastructure",
    weight: 1,
    isKnockOut: false,
    enabled: true,
    keywords: []
  });
  
  const [keywordsInput, setKeywordsInput] = useState("");
  const [scoringConfig, setScoringConfig] = useState<ScoringModelConfig>(loadScoringModelConfig());
  const [baselineScoringConfig, setBaselineScoringConfig] = useState<ScoringModelConfig>(loadScoringModelConfig());

  const addQuestionMutation = useMutation({
    mutationFn: (data: any) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => deleteQuestionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Array<{ id: string; enabled?: boolean; weight?: number }>) => bulkUpdateQuestions(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    }
  });

  if (user?.role !== "admin") {
    return <div className="p-4">Access Denied</div>;
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

  const enabledQuestions = localQuestions.filter(q => q.enabled);
  const totalWeight = enabledQuestions.reduce((acc, q) => acc + q.weight, 0);
  const knockOutCount = localQuestions.filter(q => q.isKnockOut).length;
  const categories: string[] = Array.from(new Set(localQuestions.map(q => q.category)));

  const handleLocalUpdate = (id: string, updates: Partial<Question>) => {
    setLocalQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    const updates = localQuestions.map(q => ({
      id: q.id,
      enabled: q.enabled,
      weight: q.weight
    }));
    bulkUpdateMutation.mutate(updates);
    setHasChanges(false);
    toast({
      title: "Changes Saved",
      description: "Evaluation criteria have been updated successfully."
    });
  };

  const handleDiscardChanges = () => {
    if (confirm("Discard all unsaved changes?")) {
      const safeQuestions = Array.isArray(questions) ? questions.map(normalizeQuestion) : [];
      setLocalQuestions(safeQuestions);
      setHasChanges(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (hasChanges) {
       if(!confirm("You have unsaved changes. Saving them now before adding new question.")) {
         return;
       }
       handleSaveChanges();
    }

    addQuestionMutation.mutate({
      ...newQuestion,
      keywords: newQuestion.type === "Text" && keywordsInput ? keywordsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined
    });
    
    setIsAddOpen(false);
    setNewQuestion({
      text: "",
      type: "YesNo",
      category: "Infrastructure",
      weight: 1,
      isKnockOut: false,
      enabled: true,
      keywords: []
    });
    setKeywordsInput("");
    
    toast({
      title: "Question Added",
      description: "The new evaluation question has been created."
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      if (hasChanges) {
        handleSaveChanges();
      }
      deleteQuestionMutation.mutate(id);
      toast({
        title: "Question Deleted",
        description: "Question has been removed."
      });
    }
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const getCategoryQuestions = (cat: string) => localQuestions.filter(q => q.category === cat);
  const getCategoryWeight = (cat: string) => getCategoryQuestions(cat).filter(q => q.enabled).reduce((acc, q) => acc + q.weight, 0);
  const getCategoryKnockOuts = (cat: string) => getCategoryQuestions(cat).filter(q => q.isKnockOut).length;
  const groupWeightTotal = Object.values(scoringConfig.groupWeights).reduce((acc, n) => acc + n, 0);

  const handleGroupWeightChange = (group: keyof ScoringModelConfig["groupWeights"], value: number) => {
    setScoringConfig((prev) => ({
      ...prev,
      groupWeights: {
        ...prev.groupWeights,
        [group]: value,
      },
    }));
  };

  const handleScoringConfigSave = () => {
    saveScoringModelConfig(scoringConfig);
    setBaselineScoringConfig(scoringConfig);
    toast({
      title: "Scoring Model Updated",
      description: "Group weights and gate thresholds are now active.",
    });
  };

  const handleScoringConfigReset = () => {
    setScoringConfig(DEFAULT_SCORING_CONFIG);
    saveScoringModelConfig(DEFAULT_SCORING_CONFIG);
    setBaselineScoringConfig(DEFAULT_SCORING_CONFIG);
    toast({
      title: "Scoring Model Reset",
      description: "Default weighting and gates have been restored.",
    });
  };

  const simulationData = (() => {
    const defaultData = {
      simulationSites: [] as any[],
      simulationError: "",
      simulationSummary: {
        baseline: { Approved: 0, Conditional: 0, Rejected: 0 },
        draft: { Approved: 0, Conditional: 0, Rejected: 0 },
        upgrades: 0,
        downgrades: 0,
        unchanged: 0,
      },
      changedSitesPreview: [] as Array<{
        id: string;
        name: string;
        baselineStatus: string;
        draftStatus: string;
        baselineScore: number;
        draftScore: number;
        delta: number;
      }>,
    };

    if (!simulatorOpen || !Array.isArray(sites) || localQuestions.length === 0) {
      return defaultData;
    }

    try {
      const simulationSites = sites.filter(
        (site: any) =>
          site &&
          typeof site === "object" &&
          site.answers &&
          typeof site.answers === "object" &&
          Object.keys(site.answers).length > 0
      );

      const statusRank: Record<string, number> = { Rejected: 0, Conditional: 1, Approved: 2 };
      const statusKeys = ["Approved", "Conditional", "Rejected"] as const;

      const simulationResults = simulationSites.map((site: any) => {
        const safeAnswers = typeof site.answers === "object" ? site.answers : {};
        const baseline = calculateScore(safeAnswers, localQuestions, baselineScoringConfig);
        const draft = calculateScore(safeAnswers, localQuestions, scoringConfig);
        const delta = (statusRank[draft.status] ?? 0) - (statusRank[baseline.status] ?? 0);
        return {
          id: String(site.id ?? ""),
          name: String(site.contactName ?? "Unnamed Site"),
          baselineStatus: baseline.status,
          draftStatus: draft.status,
          baselineScore: baseline.score,
          draftScore: draft.score,
          delta,
        };
      });

      const simulationSummary = simulationResults.reduce(
        (acc, r) => {
          if (statusKeys.includes(r.baselineStatus as any)) {
            acc.baseline[r.baselineStatus as "Approved" | "Conditional" | "Rejected"] += 1;
          }
          if (statusKeys.includes(r.draftStatus as any)) {
            acc.draft[r.draftStatus as "Approved" | "Conditional" | "Rejected"] += 1;
          }
          if (r.delta > 0) acc.upgrades += 1;
          else if (r.delta < 0) acc.downgrades += 1;
          else acc.unchanged += 1;
          return acc;
        },
        {
          baseline: { Approved: 0, Conditional: 0, Rejected: 0 },
          draft: { Approved: 0, Conditional: 0, Rejected: 0 },
          upgrades: 0,
          downgrades: 0,
          unchanged: 0,
        }
      );

      const changedSitesPreview = simulationResults
        .filter((r) => r.delta !== 0 || r.baselineScore !== r.draftScore)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || Math.abs(b.draftScore - b.baselineScore) - Math.abs(a.draftScore - a.baselineScore))
        .slice(0, 6);

      return {
        simulationSites,
        simulationError: "",
        simulationSummary,
        changedSitesPreview,
      };
    } catch (error: any) {
      return {
        ...defaultData,
        simulationError: error?.message || "Unexpected simulator error",
      };
    }
  })();

  const { simulationSites, simulationSummary, changedSitesPreview, simulationError } = simulationData;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold text-primary" data-testid="text-evaluation-title">Evaluation Setup</h1>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
            <p className="text-muted-foreground mt-1">Manage questionnaire scoring with a two-layer model: weighted groups + critical/minimum gates.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-question">
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Create a new question for the site evaluation form.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newQuestion.category} 
                    onValueChange={(val) => setNewQuestion({...newQuestion, category: val})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {getConfig(cat).icon} {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="New Category">+ New Category...</SelectItem>
                    </SelectContent>
                  </Select>
                  {newQuestion.category === "New Category" && (
                     <Input 
                       placeholder="Enter new category name" 
                       onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                     />
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Input 
                    id="text" 
                    value={newQuestion.text} 
                    onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                    placeholder="e.g., Do you have a generator?"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newQuestion.type} 
                      onValueChange={(val: any) => setNewQuestion({...newQuestion, type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YesNo">Yes / No</SelectItem>
                        <SelectItem value="Text">Free Text</SelectItem>
                        <SelectItem value="Select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Question Weight (within category)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      min="0"
                      value={newQuestion.weight} 
                      onChange={(e) => setNewQuestion({...newQuestion, weight: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {newQuestion.type === "Text" && (
                  <div className="grid gap-2">
                    <Label htmlFor="keywords">Scoring Keywords (comma separated)</Label>
                    <Input 
                      id="keywords" 
                      placeholder="e.g. Epic, Cerner, Medidata"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Answers containing these words get higher scores. Answers with "No" get 0.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                  <Checkbox 
                    id="knockout" 
                    checked={newQuestion.isKnockOut}
                    onCheckedChange={(checked) => setNewQuestion({...newQuestion, isKnockOut: checked as boolean})}
                  />
                  <div>
                    <Label htmlFor="knockout" className="text-sm font-semibold text-red-700 cursor-pointer flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Critical Gate Question
                    </Label>
                    <p className="text-[11px] text-red-600 mt-0.5">Fails on critical questions trigger gate penalties; multiple failures force not approved.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddQuestion}>Save Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>


<Card className="border-dashed border-amber-300 bg-amber-50/40 overflow-hidden">
          <CardHeader>
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => setFaqOpen((v) => !v)}
              data-testid="button-toggle-scoring-faq"
            >
              <div>
                <CardTitle>Scoring FAQ</CardTitle>
                <CardDescription>Tap to expand and read.</CardDescription>
              </div>
              {faqOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
          </CardHeader>
          {faqOpen && (
          <CardContent className="space-y-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <p className="font-semibold">Q: Why does Infrastructure show 34 and also 25?</p>
              <p>A: <strong>34</strong> is the internal sum of question weights inside that category. <strong>25</strong> is the global group weight used in the final score formula.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I increase a Group Weight, what happens?</p>
              <p>A: That group has more influence on the final score. Strong performance there helps more; weak performance there hurts more.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I decrease a Group Weight, what happens?</p>
              <p>A: That group has less influence on the final score. Good or bad results in that group move the final score less.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I increase a Gate minimum (for example Quality min %), what happens?</p>
              <p>A: The model becomes stricter. More sites can fail the gate and be forced to Not Approved, even with a decent total score.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I decrease a Gate minimum, what happens?</p>
              <p>A: The model becomes more permissive. Fewer sites fail that gate, so more can pass to Approved/Conditional.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I increase “Critical Fails to Reject”, what happens?</p>
              <p>A: You require more critical failures before automatic rejection. This is less strict.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I decrease “Critical Fails to Reject”, what happens?</p>
              <p>A: Rejection happens faster with fewer critical failures. This is more strict.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I increase a Question Weight, what happens?</p>
              <p>A: That question matters more inside its category/group score. A good answer helps more; a poor answer hurts more.</p>
            </div>
            <div>
              <p className="font-semibold">Q: If I decrease a Question Weight, what happens?</p>
              <p>A: That question matters less in the category/group score. Its impact on the final result is reduced.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Can a high total score still fail?</p>
              <p>A: Yes. Gates are safety rules. If essential quality/staff/critical conditions fail, gates can override the raw score.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Quick formula summary</p>
              <p>A: 1) Compute each group % from question weights and answers. 2) Compute weighted final score using Group Weights. 3) Apply Gates. 4) Assign final classification.</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Q: What does each Group Weight mean?</p>
              <p>A: Group Weights define how much each area contributes to the final score. Higher weight = bigger impact.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Infrastructure weight</p>
              <p>A: Controls how much site facilities, equipment, and operational capacity affect the final result.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Staff weight</p>
              <p>A: Controls how much team capability, training, and execution quality affect the final result.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Quality weight</p>
              <p>A: Controls how much SOP/CAPA/compliance quality affects the final result. Usually the most sensitive area.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Recruitment weight</p>
              <p>A: Controls how much patient access and recruitment strength affect the final score.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Systems weight</p>
              <p>A: Controls how much technology, data integrity, and sponsor-process readiness affect the final score.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Total Group Weight</p>
              <p>A: This should ideally be 100. If total is lower or higher, relative influence still works, but calibration becomes harder to read.</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Q: What does each Gate / Threshold mean?</p>
              <p>A: Gates are minimum safety rules. Thresholds are score cutoffs for final labels.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Min Critical Category %</p>
              <p>A: Minimum required score in critical categories (for example Quality Management, Patient Safety). Below this, site is blocked.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Min Quality Group %</p>
              <p>A: Minimum score required for the full Quality group. If lower, final status is forced down regardless of total score.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Min Staff Group %</p>
              <p>A: Minimum score required for Staff group. Low staff readiness can block approval even with good overall points.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Critical Fails to Reject</p>
              <p>A: Number of failed critical questions that triggers automatic rejection/block. Lower number = stricter model.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Excellent Threshold %</p>
              <p>A: Minimum final weighted score for “Excellent / Sobresaliente”. Raise it to make excellent status harder.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Approved Threshold %</p>
              <p>A: Minimum final weighted score for “Approved / Aprobado”. Below this threshold, site is not approved (unless gates already blocked it first).</p>
            </div>
          </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{localQuestions.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{enabledQuestions.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Active Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {totalWeight}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total Question Weight</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="h-6 w-6" />
                  {knockOutCount}
                </div>
                <p className="text-sm text-red-600/80 mt-1">Knock-Out Questions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Scoring Model</CardTitle>
            <CardDescription>Two-layer evaluation: weighted groups + critical gates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Group Weights</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Infrastructure</Label>
                  <Input type="number" min="0" value={scoringConfig.groupWeights.infrastructure} onChange={(e) => handleGroupWeightChange("infrastructure", parseInt(e.target.value) || 0)} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.groupWeights.infrastructure}</p>
                </div>
                <div className="space-y-1">
                  <Label>Staff</Label>
                  <Input type="number" min="0" value={scoringConfig.groupWeights.staff} onChange={(e) => handleGroupWeightChange("staff", parseInt(e.target.value) || 0)} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.groupWeights.staff}</p>
                </div>
                <div className="space-y-1">
                  <Label>Quality</Label>
                  <Input type="number" min="0" value={scoringConfig.groupWeights.quality} onChange={(e) => handleGroupWeightChange("quality", parseInt(e.target.value) || 0)} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.groupWeights.quality}</p>
                </div>
                <div className="space-y-1">
                  <Label>Recruitment</Label>
                  <Input type="number" min="0" value={scoringConfig.groupWeights.recruitment} onChange={(e) => handleGroupWeightChange("recruitment", parseInt(e.target.value) || 0)} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.groupWeights.recruitment}</p>
                </div>
                <div className="space-y-1">
                  <Label>Systems</Label>
                  <Input type="number" min="0" value={scoringConfig.groupWeights.systems} onChange={(e) => handleGroupWeightChange("systems", parseInt(e.target.value) || 0)} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.groupWeights.systems}</p>
                </div>
                <div className="space-y-1">
                  <Label>Total Group Weight</Label>
                  <Input value={groupWeightTotal} readOnly />
                  <p className="text-[11px] text-muted-foreground">Suggested total: 100</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Gates and Thresholds</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Min Critical Category %</Label>
                  <Input type="number" min="0" max="100" value={scoringConfig.minimums.criticalCategory} onChange={(e) => setScoringConfig((prev) => ({ ...prev, minimums: { ...prev.minimums, criticalCategory: parseInt(e.target.value) || 0 } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.minimums.criticalCategory}%</p>
                </div>
                <div className="space-y-1">
                  <Label>Min Quality Group %</Label>
                  <Input type="number" min="0" max="100" value={scoringConfig.minimums.qualityGroup} onChange={(e) => setScoringConfig((prev) => ({ ...prev, minimums: { ...prev.minimums, qualityGroup: parseInt(e.target.value) || 0 } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.minimums.qualityGroup}%</p>
                </div>
                <div className="space-y-1">
                  <Label>Min Staff Group %</Label>
                  <Input type="number" min="0" max="100" value={scoringConfig.minimums.staffGroup} onChange={(e) => setScoringConfig((prev) => ({ ...prev, minimums: { ...prev.minimums, staffGroup: parseInt(e.target.value) || 0 } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.minimums.staffGroup}%</p>
                </div>
                <div className="space-y-1">
                  <Label>Critical Fails to Reject</Label>
                  <Input type="number" min="1" value={scoringConfig.minimums.criticalFailuresForRejection} onChange={(e) => setScoringConfig((prev) => ({ ...prev, minimums: { ...prev.minimums, criticalFailuresForRejection: Math.max(1, parseInt(e.target.value) || 1) } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.minimums.criticalFailuresForRejection}</p>
                </div>
                <div className="space-y-1">
                  <Label>Excellent Threshold %</Label>
                  <Input type="number" min="0" max="100" value={scoringConfig.thresholds.excellent} onChange={(e) => setScoringConfig((prev) => ({ ...prev, thresholds: { ...prev.thresholds, excellent: parseInt(e.target.value) || 0 } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.thresholds.excellent}%</p>
                </div>
                <div className="space-y-1">
                  <Label>Approved Threshold %</Label>
                  <Input type="number" min="0" max="100" value={scoringConfig.thresholds.approved} onChange={(e) => setScoringConfig((prev) => ({ ...prev, thresholds: { ...prev.thresholds, approved: parseInt(e.target.value) || 0 } }))} />
                  <p className="text-[11px] text-muted-foreground">Suggested: {DEFAULT_SCORING_CONFIG.thresholds.approved}%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleScoringConfigReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Model
              </Button>
              <Button onClick={handleScoringConfigSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Model
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/30">
          <CardHeader>
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => setSimulatorOpen((v) => !v)}
              data-testid="button-toggle-simulator"
            >
              <div>
                <CardTitle>What-if Scoring Simulator</CardTitle>
                <CardDescription>
                  Compare saved model vs current draft using existing site answers before saving changes.
                </CardDescription>
              </div>
              {simulatorOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
          </CardHeader>
          {simulatorOpen && (
          <CardContent className="space-y-4">
            {simulationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Simulator error: {simulationError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{simulationSummary.upgrades}</div>
                    <p className="text-sm text-muted-foreground mt-1">Sites Upgraded</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{simulationSummary.downgrades}</div>
                    <p className="text-sm text-muted-foreground mt-1">Sites Downgraded</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{simulationSummary.unchanged}</div>
                    <p className="text-sm text-muted-foreground mt-1">Unchanged</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-semibold mb-2">Saved Model Distribution</p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between"><span>Approved</span><span className="font-semibold">{simulationSummary.baseline.Approved}</span></div>
                  <div className="flex items-center justify-between"><span>Conditional</span><span className="font-semibold">{simulationSummary.baseline.Conditional}</span></div>
                  <div className="flex items-center justify-between"><span>Rejected</span><span className="font-semibold">{simulationSummary.baseline.Rejected}</span></div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-semibold mb-2">Draft Model Distribution</p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between"><span>Approved</span><span className="font-semibold">{simulationSummary.draft.Approved}</span></div>
                  <div className="flex items-center justify-between"><span>Conditional</span><span className="font-semibold">{simulationSummary.draft.Conditional}</span></div>
                  <div className="flex items-center justify-between"><span>Rejected</span><span className="font-semibold">{simulationSummary.draft.Rejected}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold mb-2">Most Impacted Sites</p>
              {changedSitesPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status or score changes detected with the current draft model.</p>
              ) : (
                <div className="space-y-2">
                  {changedSitesPreview.map((site) => (
                    <div key={site.id} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-4">{site.name}</span>
                      <span className="text-muted-foreground">
                        {site.baselineStatus} ({site.baselineScore}) {"->"} {site.draftStatus} ({site.draftScore})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Population used: {simulationSites.length} sites with completed answers.
              </p>
            </div>
          </CardContent>
          )}
        </Card>

        

        {hasChanges && (
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm font-medium text-amber-800">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleDiscardChanges} className="text-amber-700 hover:text-amber-900">
                Discard
              </Button>
              <Button size="sm" onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {categories.map(cat => {
            const config = getConfig(cat);
            const catQuestions = getCategoryQuestions(cat);
            const catWeight = getCategoryWeight(cat);
            const catKnockOuts = getCategoryKnockOuts(cat);
            const isCollapsed = collapsedCategories.has(cat);
            const enabledCount = catQuestions.filter(q => q.enabled).length;

            return (
              <Card key={cat} className={`overflow-hidden transition-all duration-200 ${config.border}`} data-testid={`card-category-${cat}`}>
                <div 
                  className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-muted/30 transition-colors ${config.bg}`}
                  onClick={() => toggleCategory(cat)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h2 className={`text-lg font-bold ${config.color}`}>{cat}</h2>
                      <p className="text-xs text-muted-foreground">
                        {enabledCount} of {catQuestions.length} questions active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {catKnockOuts > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                        <ShieldAlert className="h-3 w-3" />
                        {catKnockOuts} KO
                      </div>
                    )}
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${catWeight > 0 ? 'bg-white/80 text-primary border border-primary/20' : 'bg-gray-100 text-gray-500'}`}>
                      {catWeight} pts
                    </div>
                    {isCollapsed ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>

                {!isCollapsed && (
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {catQuestions.map((q, idx) => (
                        <div 
                          key={q.id} 
                          className={`flex items-start gap-4 px-6 py-4 transition-all duration-200 ${!q.enabled ? 'opacity-50 bg-muted/30' : 'hover:bg-muted/10'}`}
                          data-testid={`question-row-${q.id}`}
                        >
                          <div className="flex items-center gap-3 pt-0.5 shrink-0">
                            <Switch 
                              checked={q.enabled !== false}
                              onCheckedChange={(checked) => handleLocalUpdate(q.id, { enabled: checked })}
                              data-testid={`switch-question-${q.id}`}
                            />
                            <span className="text-xs text-muted-foreground font-mono w-6 text-center">{idx + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start gap-2">
                              <p className="text-sm font-medium leading-relaxed text-foreground">{q.text}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <TypeBadge type={q.type} />
                              {q.isKnockOut && (
                                <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 animate-in fade-in duration-300">
                                  <Zap className="h-3 w-3" />
                                  KNOCK OUT
                                </div>
                              )}
                              {Array.isArray(q.keywords) && q.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {q.keywords.map((k, i) => (
                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{k}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <Label className="text-xs text-muted-foreground">Weight</Label>
                              <Input 
                                type="number" 
                                className="w-16 h-8 text-center font-bold" 
                                value={q.weight}
                                min="0"
                                onChange={(e) => handleLocalUpdate(q.id, { weight: parseInt(e.target.value) || 0 })}
                                data-testid={`input-weight-${q.id}`}
                              />
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                              onClick={() => handleDeleteQuestion(q.id)}
                              data-testid={`button-delete-${q.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No questions configured yet. Click "Add Question" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

