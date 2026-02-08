import { useState } from "react";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Question } from "@/lib/types";

export default function EvaluationSetup() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, toggleQuestion, user } = useStore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // New Question State
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: "",
    type: "YesNo",
    category: "Infraestructura",
    weight: 1,
    isKnockOut: false,
    enabled: true,
    keywords: []
  });
  
  const [keywordsInput, setKeywordsInput] = useState("");

  if (user?.role !== "admin") {
    return <div className="p-4">Access Denied</div>;
  }

  const totalWeight = questions.filter(q => q.enabled).reduce((acc, q) => acc + q.weight, 0);

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    addQuestion({
      ...newQuestion,
      keywords: newQuestion.type === "Text" && keywordsInput ? keywordsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined
    } as Omit<Question, "id">);
    
    setIsAddOpen(false);
    setNewQuestion({
      text: "",
      type: "YesNo",
      category: "Infraestructura",
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

  const categories = Array.from(new Set(questions.map(q => q.category)));

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Evaluation Setup</h1>
            <p className="text-muted-foreground">Manage the questionnaire and scoring criteria.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-md border flex items-center gap-2 ${totalWeight === 100 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
              <span className="font-bold text-lg">{totalWeight}%</span>
              <span className="text-sm">Total Weight</span>
              {totalWeight !== 100 && <AlertTriangle className="h-4 w-4" />}
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Question</DialogTitle>
                  <DialogDescription>
                    Create a new question for the site evaluation form.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={newQuestion.category} 
                        onValueChange={(val) => setNewQuestion({...newQuestion, category: val})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          <SelectItem value="New Category">New Category...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="weight">Weight Points</Label>
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
                        placeholder="e.g. Epic, Cerner, Medidata (Matches increase score)"
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        If provided, answers containing these words get higher scores. Answers with "No" get 0.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="knockout" 
                      checked={newQuestion.isKnockOut}
                      onCheckedChange={(checked) => setNewQuestion({...newQuestion, isKnockOut: checked as boolean})}
                    />
                    <Label htmlFor="knockout" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is Knock-Out Question? (Auto-reject if failed)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddQuestion}>Save Question</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questions List</CardTitle>
            <CardDescription>
              Toggle visibility to show/hide questions in the form. Adjust weights to sum to 100%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Weight</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id} className={!q.enabled ? "opacity-60 bg-muted/50" : ""}>
                    <TableCell>
                      <Switch 
                        checked={q.enabled !== false}
                        onCheckedChange={(checked) => toggleQuestion(q.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{q.text}</span>
                        {q.isKnockOut && (
                          <Badge variant="destructive" className="w-fit text-[10px] px-1 py-0 h-5">Knock Out</Badge>
                        )}
                        {q.keywords && q.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.keywords.map((k, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1 rounded border border-blue-100">{k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{q.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{q.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="w-16 h-8" 
                        value={q.weight}
                        min="0"
                        onChange={(e) => updateQuestion(q.id, { weight: parseInt(e.target.value) || 0 })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
