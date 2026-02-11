import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchSite, fetchQuestions, updateSiteStatus as updateSiteStatusApi, generateToken as generateTokenApi, updateSiteAnswers as updateSiteAnswersApi, fetchTermsAcceptanceBySiteId } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/star-rating";
import { ArrowLeft, Mail, MapPin, Calendar, FileText, Download, File, CheckCircle2, XCircle, Clock, AlertTriangle, FileDown, Send, Edit, Save, RefreshCw, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { QUESTIONS, type SiteClassification } from "@/lib/questions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import { calculateScore } from "@/lib/questions";

export default function CenterDetail() {
  const [, params] = useRoute("/admin/centers/:id");
  const { user } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["/api/sites", params?.id],
    queryFn: () => fetchSite(params!.id),
    enabled: !!params?.id,
    refetchInterval: 10000,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: fetchQuestions,
    refetchInterval: 30000,
  });

  const { data: termsRecord } = useQuery({
    queryKey: ["/api/terms-acceptance", params?.id],
    queryFn: () => fetchTermsAcceptanceBySiteId(params!.id),
    enabled: !!params?.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (site) {
      setEditedAnswers(site.answers || {});
    }
  }, [site]);

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => updateSiteStatusApi(site.id, status, user?.name || "Admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  const tokenMutation = useMutation({
    mutationFn: () => generateTokenApi(site.id, user?.name || "Admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  const answersMutation = useMutation({
    mutationFn: ({ answers, score }: { answers: any; score: number }) => 
      updateSiteAnswersApi(site.id, answers, score, user?.name || "Admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  if (siteLoading || !site) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const questionsList = questions.length > 0 ? questions : QUESTIONS;

  const handleGenerateToken = () => {
    tokenMutation.mutate();
    toast({
      title: "Token Generated",
      description: "Invitation email with new token has been sent to the site.",
    });
  };

  const handleSaveChanges = () => {
    let score = 0;
    if (typeof calculateScore === 'function') {
      const result = calculateScore(editedAnswers, questionsList);
      score = result.score;
    }
    answersMutation.mutate({ answers: editedAnswers, score });
    setIsEditing(false);
    toast({
      title: "Changes Saved",
      description: "Site responses have been updated successfully.",
    });
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    const brandDark = [0, 25, 101] as const;
    const brandBlue = [0, 90, 210] as const;
    const gray600 = [75, 85, 99] as const;
    const gray400 = [156, 163, 175] as const;
    const gray200 = [229, 231, 235] as const;
    const white = [255, 255, 255] as const;

    const result = calculateScore(site.answers || {}, questionsList);

    const drawHeader = (pageNum: number, totalPages: number) => {
      doc.setFillColor(...brandDark);
      doc.rect(0, 0, pageWidth, 32, 'F');
      doc.setFillColor(...brandBlue);
      doc.rect(0, 32, pageWidth, 3, 'F');

      doc.setTextColor(...white);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("INNOVA TRIALS LLC", margin, 15);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Site Evaluation Report", margin, 22);

      doc.setFontSize(7);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 22, { align: "right" });
      doc.text("CONFIDENTIAL", pageWidth - margin, 15, { align: "right" });
    };

    const drawFooter = () => {
      doc.setDrawColor(...gray200);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      doc.setFontSize(7);
      doc.setTextColor(...gray400);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Report generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | Innova Trials LLC | innovasitescoring.com`,
        pageWidth / 2, pageHeight - 12, { align: "center" }
      );
    };

    const checkPageBreak = (y: number, needed: number): number => {
      if (y + needed > pageHeight - 25) {
        doc.addPage();
        return 45;
      }
      return y;
    };

    const drawSectionTitle = (title: string, y: number): number => {
      y = checkPageBreak(y, 15);
      doc.setFillColor(...brandBlue);
      doc.rect(margin, y - 4, 3, 12, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text(title, margin + 7, y + 5);
      doc.setDrawColor(...gray200);
      doc.line(margin + 7, y + 8, pageWidth - margin, y + 8);
      return y + 16;
    };

    const drawInfoRow = (label: string, value: string, x: number, y: number, w: number) => {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...gray400);
      doc.text(label.toUpperCase(), x, y);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...brandDark);
      const lines = doc.splitTextToSize(value, w - 5);
      doc.text(lines, x, y + 5);
    };

    let y = 45;

    y = drawSectionTitle("SITE INFORMATION", y);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y - 2, contentWidth, 40, 2, 2, 'F');
    doc.setDrawColor(...gray200);
    doc.roundedRect(margin, y - 2, contentWidth, 40, 2, 2, 'S');

    const col1 = margin + 5;
    const col2 = margin + contentWidth / 2 + 5;
    const colW = contentWidth / 2 - 10;

    drawInfoRow("Site Name", site.contactName, col1, y + 4, colW);
    drawInfoRow("Location", site.location || "N/A", col1, y + 17, colW);
    drawInfoRow("Registration Date", new Date(site.registeredAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), col1, y + 30, colW);

    drawInfoRow("Email", site.email, col2, y + 4, colW);
    drawInfoRow("Status", site.status === "TokenSent" ? "In Evaluation" : site.status, col2, y + 17, colW);
    drawInfoRow("Evaluated By", site.evaluatedBy || "Pending", col2, y + 30, colW);

    y += 48;

    y = drawSectionTitle("EXECUTIVE SUMMARY", y);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y - 2, contentWidth, 38, 2, 2, 'F');
    doc.setDrawColor(...gray200);
    doc.roundedRect(margin, y - 2, contentWidth, 38, 2, 2, 'S');

    const scoreVal = site.score ?? 0;
    const scoreColor = scoreVal >= 80 ? [16, 185, 129] as const : scoreVal >= 50 ? [245, 158, 11] as const : [239, 68, 68] as const;

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...scoreColor);
    doc.text(`${scoreVal}%`, margin + 15, y + 22);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray400);
    doc.text("OVERALL SCORE", margin + 15, y + 28);

    const barX = margin + 55;
    const barW = contentWidth - 65;
    const barH = 6;
    const barY = y + 8;
    doc.setFillColor(...gray200);
    doc.roundedRect(barX, barY, barW, barH, 3, 3, 'F');
    if (scoreVal > 0) {
      doc.setFillColor(...scoreColor);
      doc.roundedRect(barX, barY, Math.max(6, barW * (scoreVal / 100)), barH, 3, 3, 'F');
    }

    const classLabel = result.classification || "Pending";
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text(`Classification: ${classLabel}`, barX, y + 24);

    if (result.knockOutReason) {
      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.setFont("helvetica", "normal");
      const koLines = doc.splitTextToSize(`⚠ ${result.knockOutReason}`, barW);
      doc.text(koLines, barX, y + 31);
    }

    const starStr = "★".repeat(Math.min(5, Math.max(0, Math.round(scoreVal / 20)))) + "☆".repeat(5 - Math.min(5, Math.max(0, Math.round(scoreVal / 20))));
    doc.setFontSize(12);
    doc.setTextColor(250, 204, 21);
    doc.text(starStr, barX + barW - 2, y + 24, { align: "right" });

    y += 46;

    if (result.categoryScores && Object.keys(result.categoryScores).length > 0) {
      y = drawSectionTitle("CATEGORY BREAKDOWN", y);

      const cats = Object.entries(result.categoryScores);
      const catColW = (contentWidth - 4) / 2;

      cats.forEach(([category, catScore], idx) => {
        const colIdx = idx % 2;
        const catX = margin + colIdx * (catColW + 4);

        if (colIdx === 0) {
          y = checkPageBreak(y, 18);
        }

        const catColor = catScore >= 80 ? [16, 185, 129] as const : catScore >= 50 ? [245, 158, 11] as const : [239, 68, 68] as const;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(catX, y - 2, catColW, 14, 1, 1, 'F');
        doc.setDrawColor(...gray200);
        doc.roundedRect(catX, y - 2, catColW, 14, 1, 1, 'S');

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text(category, catX + 4, y + 5);

        doc.setTextColor(...catColor);
        doc.text(`${Math.round(catScore)}%`, catX + catColW - 25, y + 5);

        const miniBarX = catX + 4;
        const miniBarW = catColW - 35;
        const miniBarY = y + 7;
        doc.setFillColor(...gray200);
        doc.roundedRect(miniBarX, miniBarY, miniBarW, 3, 1.5, 1.5, 'F');
        if (catScore > 0) {
          doc.setFillColor(...catColor);
          doc.roundedRect(miniBarX, miniBarY, Math.max(3, miniBarW * (catScore / 100)), 3, 1.5, 1.5, 'F');
        }

        if (colIdx === 1 || idx === cats.length - 1) {
          y += 18;
        }
      });

      y += 4;
    }

    y = drawSectionTitle("DETAILED EVALUATION RESPONSES", y);

    const categories = [...new Set(questionsList.map((q: any) => q.category))];
    let questionNum = 1;

    categories.forEach((category: string) => {
      const catQuestions = questionsList.filter((q: any) => q.category === category);

      y = checkPageBreak(y, 14);

      doc.setFillColor(...brandDark);
      doc.roundedRect(margin, y - 3, contentWidth, 10, 1, 1, 'F');
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text(category.toUpperCase(), margin + 5, y + 4);

      const catScore = result.categoryScores?.[category];
      if (catScore !== undefined) {
        doc.text(`${Math.round(catScore)}%`, pageWidth - margin - 5, y + 4, { align: "right" });
      }

      y += 14;

      catQuestions.forEach((q: any) => {
        const ans = site.answers?.[q.id];
        let val = "Not Answered";
        let starValue = 0;
        if (typeof ans === 'object' && ans?.value !== undefined) {
          val = String(ans.value);
          starValue = Number(ans.value) || 0;
        } else if (ans !== undefined && ans !== null) {
          val = String(ans);
          starValue = Number(ans) || 0;
        }

        const questionLines = doc.splitTextToSize(`${q.text}`, contentWidth - 15);
        const neededHeight = (questionLines.length * 4.5) + 14;
        y = checkPageBreak(y, neededHeight);

        if (questionNum % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 3, contentWidth, neededHeight, 'F');
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandBlue);
        doc.text(`Q${questionNum}`, margin + 2, y + 1);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray600);
        doc.setFontSize(8);
        doc.text(questionLines, margin + 12, y + 1);
        y += questionLines.length * 4.5 + 1;

        if (q.type === "YesNo" && starValue > 0) {
          const stars = "★".repeat(starValue) + "☆".repeat(5 - starValue);
          doc.setFontSize(10);
          doc.setTextColor(250, 204, 21);
          doc.text(stars, margin + 12, y + 2);
          doc.setFontSize(8);
          doc.setTextColor(...gray600);
          doc.text(`(${starValue}/5)`, margin + 32, y + 2);
        } else {
          const ansColor = val === "Not Answered" ? gray400 : brandDark;
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...ansColor);
          const ansLines = doc.splitTextToSize(val, contentWidth - 20);
          doc.text(ansLines, margin + 12, y + 2);
          y += (ansLines.length - 1) * 4;
        }

        y += 8;
        questionNum++;
      });

      y += 4;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawHeader(i, pageCount);
      drawFooter();
    }

    doc.save(`Innova_Trials_Report_${site.contactName.replace(/[^a-z0-9]/gi, '_')}.pdf`);

    toast({
      title: "Report Downloaded",
      description: "Professional PDF report has been generated.",
    });
  };

  const handleStatusChange = (newStatus: "Approved" | "Rejected" | "ToConsider") => {
    statusMutation.mutate({ status: newStatus });
    
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

  const allAttachments = Object.entries(site.answers || {})
    .flatMap(([qId, answer]: [string, any]) => {
      if (typeof answer === 'object' && answer?.attachment) {
        const question = questionsList.find((q: any) => q.id === qId);
        const attachmentList = Array.isArray(answer.attachment) ? answer.attachment : [answer.attachment];
        
        return attachmentList.map((att: any) => ({
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
            {site.score !== undefined && (() => {
              const result = calculateScore(site.answers || {}, questionsList);
              return (
                <div className="flex flex-col items-end bg-white p-4 rounded-lg border shadow-sm">
                  <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-1">Overall Score</span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-primary">{site.score}%</span>
                    <div className="flex flex-col items-center">
                      <StarRating score={site.score} size="md" />
                      <span className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${
                        result.classification === "Sobresaliente" ? "bg-emerald-100 text-emerald-700" :
                        result.classification === "Aprobado" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {result.classification}
                      </span>
                    </div>
                  </div>
                  {result.knockOutReason && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {result.knockOutReason}
                    </p>
                  )}
                </div>
              );
            })()}
            
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
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ToConsider")} className="text-amber-600 font-medium">
                    <Clock className="mr-2 h-4 w-4" /> In Observation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Rejected")} className="text-red-600 font-medium">
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
                      {questionsList.map((q: any) => {
                        const answerEntry = isEditing ? editedAnswers[q.id] : site.answers[q.id];
                        
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
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const currentStars = typeof answerValue === 'string' ? parseInt(answerValue, 10) : Number(answerValue);
                                      return (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => handleAnswerChange(q.id, star)}
                                          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                          <Star
                                            className={`h-6 w-6 transition-colors ${
                                              star <= (isNaN(currentStars) ? 0 : currentStars)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-transparent text-gray-300"
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      {answerValue ? `${answerValue}/5` : "Not rated"}
                                    </span>
                                  </div>
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
                                  {q.type === "YesNo" ? (
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => {
                                        const currentStars = typeof answerValue === 'string' ? parseInt(answerValue, 10) : Number(answerValue);
                                        return (
                                          <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                              star <= (isNaN(currentStars) ? 0 : currentStars)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-transparent text-gray-300"
                                            }`}
                                          />
                                        );
                                      })}
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        {answerValue && !isNaN(Number(answerValue)) ? `${answerValue}/5` : (answerValue || "Not Answered")}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit bg-gray-100 text-gray-800`}>
                                      {answerValue || "Not Answered"}
                                    </div>
                                  )}
                                  {attachments.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      {attachments.map((att: any, idx: number) => (
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

            <Card data-testid="card-legal-compliance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {termsRecord ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <ShieldX className="h-5 w-5 text-muted-foreground" />}
                  Legal Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {termsRecord ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-600" data-testid="badge-terms-accepted">Terms Accepted</Badge>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Accepted By</label>
                      <p className="font-medium text-sm" data-testid="text-terms-registrant">{termsRecord.registrantName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Email</label>
                      <p className="text-sm" data-testid="text-terms-email">{termsRecord.registrantEmail}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Accepted On (UTC)</label>
                      <p className="text-sm" data-testid="text-terms-date">
                        {new Date(termsRecord.acceptedAtUtc).toLocaleString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                          hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC"
                        })} UTC
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Terms Version</label>
                      <p className="text-sm font-medium" data-testid="text-terms-version">v{termsRecord.termsVersion} (Effective: {termsRecord.termsEffectiveDate})</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">IP Address</label>
                      <p className="text-sm font-mono" data-testid="text-terms-ip">{termsRecord.ipAddress || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">User Agent</label>
                      <p className="text-xs text-muted-foreground break-all" data-testid="text-terms-useragent">{termsRecord.userAgent || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">SHA-256 Hash</label>
                      <div className="p-2 bg-muted rounded font-mono text-[10px] break-all" data-testid="text-terms-hash">
                        {termsRecord.termsTextSha256}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <ShieldX className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Terms Not Accepted</p>
                    <p className="text-xs">This site has not yet accepted the registration terms.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
