import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/star-rating";
import { ArrowLeft, Mail, MapPin, Calendar, FileText, Download, File, CheckCircle2, XCircle, Clock, AlertTriangle, FileDown, Send, Edit, Save, RefreshCw } from "lucide-react";
import { QUESTIONS } from "@/lib/questions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";

export default function CenterDetail() {
  const [, params] = useRoute("/admin/centers/:id");
  const { sites, questions, updateSiteStatus, generateToken, updateSiteAnswers } = useStore();
  const [, setLocation] = useLocation();
  const [site, setSite] = useState<any>(null);
  const { toast } = useToast();
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (params?.id) {
      const found = sites.find(s => s.id === params.id);
      setSite(found);
      if (found) {
        setEditedAnswers(found.answers || {});
      }
    }
  }, [params?.id, sites]);

  if (!site) return <div className="p-8">Loading...</div>;

  // Use dynamic questions list if available, otherwise fallback to default
  const questionsList = questions || QUESTIONS;

  const handleGenerateToken = () => {
    generateToken(site.id);
    toast({
      title: "Token Generated",
      description: "Invitation email with new token has been sent to the site.",
    });
  };

  const handleSaveChanges = () => {
    updateSiteAnswers(site.id, editedAnswers);
    setIsEditing(false);
    toast({
      title: "Changes Saved",
      description: "Site responses have been updated successfully.",
    });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    // We need to preserve attachment if it exists
    const currentAnswer = editedAnswers[questionId];
    let attachment = undefined;
    
    if (typeof currentAnswer === 'object' && currentAnswer?.attachment) {
      attachment = currentAnswer.attachment;
    }

    setEditedAnswers(prev => ({
      ...prev,
      [questionId]: attachment ? { value, attachment } : value
    }));
  };

  const handleDownloadReport = () => {
    // Generate PDF Report
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(22, 163, 74); // Green header
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INNOVA TRIALS LLC REPORT", 105, 25, { align: "center" });
    
    // Site Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SITE DETAILS", 20, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Site Name: ${site.contactName}`, 20, 70);
    doc.text(`Location: ${site.location || "N/A"}`, 20, 76);
    doc.text(`Status: ${site.status}`, 20, 82);
    doc.text(`Score: ${site.score !== undefined ? site.score + "%" : "N/A"}`, 20, 88);
    doc.text(`Registered: ${new Date(site.registeredAt).toLocaleDateString()}`, 20, 94);
    doc.text(`Evaluated: ${site.evaluatedAt ? new Date(site.evaluatedAt).toLocaleDateString() : "Pending"}`, 120, 70);
    doc.text(`Evaluated By: ${site.evaluatedBy || "N/A"}`, 120, 76);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 105, 190, 105);

    // Evaluation Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EVALUATION SUMMARY", 20, 120);

    let yPos = 135;
    const pageHeight = doc.internal.pageSize.height;

    questionsList.forEach((q, index) => {
      // Check for page break
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 30;
      }

      const ans = site.answers?.[q.id];
      let val = "Not Answered";
      if (typeof ans === 'object' && ans?.value) val = ans.value;
      else if (ans) val = ans;

      // Question Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const questionLines = doc.splitTextToSize(`${index + 1}. [${q.category}] ${q.text}`, 170);
      doc.text(questionLines, 20, yPos);
      yPos += (questionLines.length * 5) + 2;

      // Answer
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Answer: ${val}`, 25, yPos);
      yPos += 10;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages(); // Incorrect, this gets total at end, but good enough for mock
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()} - Innova Trials`, 105, pageHeight - 10, { align: "center" });
    }

    doc.save(`Report_${site.contactName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

    toast({
      title: "Report Downloaded",
      description: "Detailed PDF report has been generated.",
    });
  };

  const handleStatusChange = (newStatus: "Approved" | "Rejected" | "ToConsider") => {
    updateSiteStatus(site.id, newStatus);
    
    // Simulate email notification
    let title = "";
    let description = "";
    
    if (newStatus === "Approved") {
      title = "Status Updated: Approved";
      description = `An email has been sent to ${site.contactName}: "Congratulations! Your site has been approved. Welcome to the network."`;
    } else if (newStatus === "Rejected") {
      title = "Status Updated: Rejected";
      description = `An email has been sent to ${site.contactName}: "Thank you for your interest. We will keep your information for future opportunities."`;
    } else {
      title = "Status Updated: To Consider";
      description = "The site has been marked for observation. No email sent.";
    }

    toast({
      title,
      description,
      duration: 5000,
    });
  };

  // Collect all attachments
  const allAttachments = Object.entries(site.answers || {})
    .flatMap(([qId, answer]: [string, any]) => {
      if (typeof answer === 'object' && answer?.attachment) {
        const question = questionsList.find(q => q.id === qId);
        // Handle array of attachments or single attachment
        const attachmentList = Array.isArray(answer.attachment) ? answer.attachment : [answer.attachment];
        
        return attachmentList.map(att => ({
          questionId: qId,
          questionText: question?.text || "Unknown Question",
          attachment: att
        }));
      }
      return [];
    });

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in slide-in-from-right-8 duration-500">
        <Button variant="ghost" onClick={() => setLocation("/admin/centers")} className="pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Centers
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold text-primary flex items-center gap-3">
              {site.contactName}
              {site.status === "Approved" && <Badge className="bg-emerald-600">Approved</Badge>}
              {site.status === "Rejected" && <Badge variant="destructive">Rejected</Badge>}
              {site.status === "ToConsider" && <Badge className="bg-amber-500">To Consider</Badge>}
              {site.status === "Pending" && <Badge className="bg-blue-500">Pending</Badge>}
              {site.status === "TokenSent" && <Badge className="bg-indigo-500">In Evaluation</Badge>}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {site.email}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {site.location || "N/A"}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Registered: {new Date(site.registeredAt).toLocaleDateString()}</span>
              {site.updatedAt && (
                <span className="flex items-center gap-1 text-primary/80 font-medium">
                  <RefreshCw className="h-3.5 w-3.5" /> Updated: {new Date(site.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-end">
            {site.score !== undefined && (
              <div className="flex flex-col items-end bg-white p-4 rounded-lg border shadow-sm">
                <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-1">Overall Score</span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary">{site.score}%</span>
                  <div className="flex flex-col items-center">
                    <StarRating score={site.score} size="md" />
                    <span className="text-xs text-muted-foreground mt-1">Ranking</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleGenerateToken} className="gap-2" variant="outline">
                <Send className="h-4 w-4" /> Generate New Token
              </Button>
              
              <Button variant="outline" onClick={handleDownloadReport}>
                <FileDown className="mr-2 h-4 w-4" /> Download Report
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-between">
                    {site.status === "Approved" ? "Approved" : 
                     site.status === "Rejected" ? "Rejected" : 
                     site.status === "ToConsider" ? "In Observation" : 
                     site.status === "TokenSent" ? "In Evaluation" : 
                     site.status === "Pending" ? "Pending" : site.status}
                    <ArrowLeft className="h-4 w-4 rotate-270" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  <DropdownMenuItem onClick={() => handleStatusChange("Approved")} className="text-emerald-600 font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve (SI)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ToConsider")} className="text-amber-600 font-medium">
                    <Clock className="mr-2 h-4 w-4" /> In Observation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Rejected")} className="text-red-600 font-medium">
                    <XCircle className="mr-2 h-4 w-4" /> Reject (NO)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Evaluation Details</TabsTrigger>
                <TabsTrigger value="files">Uploaded Documents ({allAttachments.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {site.description}
                    </p>
                  </CardContent>
                </Card>

                {site.answers && Object.keys(site.answers).length > 0 ? (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Evaluation Responses</CardTitle>
                        <CardDescription>Detailed questionnaire results.</CardDescription>
                      </div>
                      <Button 
                        variant={isEditing ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                        className="gap-2"
                      >
                        {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        {isEditing ? "Save Changes" : "Edit Responses"}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {questionsList.map((q) => {
                        const answerEntry = isEditing ? editedAnswers[q.id] : site.answers[q.id];
                        // If editing and no answer yet, default to empty
                        
                        // Handle new structure vs old structure
                        let answerValue = "";
                        let attachments: any[] = [];
                        
                        if (typeof answerEntry === 'object' && answerEntry !== null && !Array.isArray(answerEntry)) {
                          if ('value' in answerEntry) {
                            answerValue = String(answerEntry.value || "");
                            if (answerEntry.attachment) {
                               attachments = Array.isArray(answerEntry.attachment) 
                                  ? answerEntry.attachment 
                                  : [answerEntry.attachment];
                            }
                          }
                        } else if (answerEntry !== undefined && answerEntry !== null && typeof answerEntry !== 'object') {
                          answerValue = String(answerEntry);
                        }
                        
                        return (
                          <div key={q.id} className="border-b last:border-0 pb-4 last:pb-0">
                            <p className="font-medium text-sm mb-2">{q.text}</p>
                            
                            {isEditing ? (
                              <div className="space-y-2">
                                {q.type === "YesNo" ? (
                                  <Select 
                                    value={answerValue} 
                                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Yes">Yes</SelectItem>
                                      <SelectItem value="No">No</SelectItem>
                                      <SelectItem value="NA">N/A</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input 
                                    value={answerValue} 
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Enter response..."
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                                    answerValue === "Yes" ? "bg-green-100 text-green-800" :
                                    answerValue === "No" ? "bg-red-100 text-red-800" :
                                    "bg-gray-100 text-gray-800"
                                  }`}>
                                    {answerValue || "Not Answered"}
                                  </div>
                                  {/* Attachment Display */}
                                  {attachments.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      {attachments.map((att, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-muted/30 p-2 rounded border w-fit">
                                          <File className="h-4 w-4 text-blue-500" />
                                          <span className="text-sm font-medium">{att.name}</span>
                                          <Badge variant="outline" className="text-[10px] h-5">{att.type?.split('/')[1] || 'file'}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {q.weight > 0 && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">Weight: {q.weight}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mb-4 opacity-20" />
                      <p>No evaluation data available yet.</p>
                      <p className="text-sm">The site has not completed the questionnaire.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="files" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>All files uploaded by the site during evaluation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allAttachments.length > 0 ? (
                      <div className="space-y-4">
                        {allAttachments.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{item.attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Response to: <span className="italic">{item.questionText.substring(0, 50)}...</span>
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" /> Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <File className="h-12 w-12 mb-4 opacity-20" />
                        <p>No files uploaded.</p>
                        <p className="text-sm">This site has not attached any documents.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Current Status</label>
                  <p className="font-medium">{site.status}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Access Token</label>
                  <div className="p-2 bg-muted rounded font-mono text-sm break-all">
                    {site.token || "Not generated"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
