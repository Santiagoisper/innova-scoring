import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchReport, fetchSite, fetchReportSignatures, acknowledgeReport } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Lock, Unlock, CheckCircle2, XCircle, AlertTriangle,
  Download, Shield, Hash, Clock, ArrowLeft, Loader2
} from "lucide-react";
import jsPDF from "jspdf";

const STATUS_PRIORITY: Record<string, number> = {
  "Critical Gap": 0,
  "Not Evidenced": 1,
  "Partially Adequate": 2,
  "Adequate": 3,
};

function getStatusColor(label: string) {
  switch (label) {
    case "Adequate": return "bg-emerald-600 hover:bg-emerald-700";
    case "Partially Adequate": return "bg-amber-500 hover:bg-amber-600";
    case "Critical Gap": return "bg-red-600 hover:bg-red-700";
    case "Not Evidenced": return "bg-gray-400 hover:bg-gray-500";
    default: return "bg-gray-400";
  }
}

function getFinalStatusBadge(status: string) {
  switch (status) {
    case "Adequate":
      return <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">{status}</Badge>;
    case "Partially Adequate":
      return <Badge className="bg-amber-500 text-white text-sm px-3 py-1">{status}</Badge>;
    case "Critical Gap":
      return <Badge className="bg-red-600 text-white text-sm px-3 py-1">{status}</Badge>;
    case "Not Evidenced":
      return <Badge className="bg-gray-400 text-white text-sm px-3 py-1">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-sm px-3 py-1">{status || "N/A"}</Badge>;
  }
}

export default function ReportDetail() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const { user } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [acknowledging, setAcknowledging] = useState(false);

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ["/api/reports", reportId],
    queryFn: () => fetchReport(reportId!),
    enabled: !!reportId,
  });

  const { data: site } = useQuery({
    queryKey: ["/api/sites", report?.siteId],
    queryFn: () => fetchSite(String(report.siteId)),
    enabled: !!report?.siteId,
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ["/api/reports", reportId, "signatures"],
    queryFn: () => fetchReportSignatures(reportId!),
    enabled: !!reportId,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (data: { signedByName: string; signedByRole: string; hashVerification: string }) =>
      acknowledgeReport(reportId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", reportId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports", reportId, "signatures"] });
      toast({ title: "Report Acknowledged", description: "Your signature has been recorded." });
      setAcknowledging(false);
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to acknowledge report." });
      setAcknowledging(false);
    },
  });

  const handleAcknowledge = () => {
    if (!user?.name || !report?.sha256Hash) return;
    setAcknowledging(true);
    acknowledgeMutation.mutate({
      signedByName: user.name,
      signedByRole: user.role || "admin",
      hashVerification: report.sha256Hash,
    });
  };

  const narrative = report?.narrativeSnapshotJson || {};
  const scoreSnapshot = report?.scoreSnapshotJson || {};
  const domainEvaluations: any[] = scoreSnapshot.domainEvaluations || [];
  const capaItems: any[] = report?.capaItemsJson || [];

  const criticalGaps = [...domainEvaluations]
    .sort((a, b) => (STATUS_PRIORITY[a.statusLabel] ?? 99) - (STATUS_PRIORITY[b.statusLabel] ?? 99))
    .slice(0, 5);

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    const brandDark = [0, 102, 161] as const;
    const brandTeal = [0, 133, 124] as const;
    const gray600 = [75, 85, 99] as const;
    const gray400 = [156, 163, 175] as const;
    const gray200 = [229, 231, 235] as const;
    const white = [255, 255, 255] as const;

    const drawHeader = (pageNum: number, totalPages: number) => {
      doc.setFillColor(...brandDark);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setFillColor(...brandTeal);
      doc.rect(0, 30, pageWidth, 3, "F");
      doc.setTextColor(...white);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("INNOVA TRIALS LLC", margin, 14);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Site Evaluation Report", margin, 22);
      doc.setFontSize(7);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 22, { align: "right" });
      doc.text("CONFIDENTIAL", pageWidth - margin, 14, { align: "right" });
    };

    const drawFooter = () => {
      doc.setDrawColor(...gray200);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      doc.setFontSize(7);
      doc.setTextColor(...gray400);
      doc.text(
        `Generated on ${new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | Innova Trials LLC`,
        pageWidth / 2, pageHeight - 12, { align: "center" }
      );
    };

    const checkPageBreak = (y: number, needed: number): number => {
      if (y + needed > pageHeight - 25) {
        doc.addPage();
        return 42;
      }
      return y;
    };

    const drawSectionTitle = (title: string, y: number): number => {
      y = checkPageBreak(y, 15);
      doc.setFillColor(...brandDark);
      doc.rect(margin, y - 4, 3, 12, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text(title, margin + 7, y + 5);
      doc.setDrawColor(...gray200);
      doc.line(margin + 7, y + 8, pageWidth - margin, y + 8);
      return y + 16;
    };

    let y = 42;

    y = drawSectionTitle("COVER PAGE", y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray600);
    doc.text(`Report Version: ${report.reportVersion || "v1"}`, margin + 7, y);
    y += 6;
    doc.text(`Site: ${site?.contactName || `Site #${report.siteId}`}`, margin + 7, y);
    y += 6;
    doc.text(`Location: ${site?.location || "N/A"}`, margin + 7, y);
    y += 6;
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin + 7, y);
    y += 6;
    doc.text(`Final Status: ${report.finalStatus || "N/A"}`, margin + 7, y);
    y += 6;
    doc.text(`Generated By: ${report.generatedByName || "N/A"}`, margin + 7, y);
    y += 14;

    if (narrative.executiveSummary) {
      y = drawSectionTitle("EXECUTIVE SUMMARY", y);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray600);
      const lines = doc.splitTextToSize(narrative.executiveSummary, contentWidth - 10);
      y = checkPageBreak(y, lines.length * 5);
      doc.text(lines, margin + 7, y);
      y += lines.length * 5 + 8;
    }

    if (domainEvaluations.length > 0) {
      y = drawSectionTitle("DOMAIN EVALUATION", y);
      const colDomain = margin + 7;
      const colStatus = margin + contentWidth * 0.65;

      doc.setFillColor(...brandDark);
      doc.rect(margin, y - 4, contentWidth, 10, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text("Domain", colDomain, y + 3);
      doc.text("Status", colStatus, y + 3);
      y += 12;

      domainEvaluations.forEach((d: any, idx: number) => {
        y = checkPageBreak(y, 8);
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 4, contentWidth, 8, "F");
        }
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray600);
        doc.text(d.displayName || d.domain || "Unknown", colDomain, y + 1);
        const sl = d.statusLabel || "N/A";
        if (sl === "Adequate") doc.setTextColor(16, 185, 129);
        else if (sl === "Partially Adequate") doc.setTextColor(245, 158, 11);
        else if (sl === "Critical Gap") doc.setTextColor(239, 68, 68);
        else doc.setTextColor(...gray400);
        doc.setFont("helvetica", "bold");
        doc.text(sl, colStatus, y + 1);
        y += 8;
      });
      y += 6;
    }

    if (criticalGaps.length > 0) {
      y = drawSectionTitle("CRITICAL GAPS (TOP 5)", y);
      criticalGaps.forEach((d: any, idx: number) => {
        y = checkPageBreak(y, 8);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text(`${idx + 1}. ${d.displayName || d.domain || "Unknown"}`, margin + 7, y + 1);
        const sl = d.statusLabel || "N/A";
        if (sl === "Critical Gap") doc.setTextColor(239, 68, 68);
        else if (sl === "Not Evidenced") doc.setTextColor(...gray400);
        else if (sl === "Partially Adequate") doc.setTextColor(245, 158, 11);
        else doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "normal");
        doc.text(`— ${sl}`, margin + 7 + doc.getTextWidth(`${idx + 1}. ${d.displayName || d.domain || "Unknown"}`) + 3, y + 1);
        y += 8;
      });
      y += 6;
    }

    if (capaItems.length > 0) {
      y = drawSectionTitle("CAPA PLAN", y);
      const cols = [margin + 7, margin + 22, margin + 55, margin + 100, margin + 140];
      doc.setFillColor(...brandDark);
      doc.rect(margin, y - 4, contentWidth, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text("Priority", cols[0], y + 3);
      doc.text("Domain", cols[1], y + 3);
      doc.text("Required Action", cols[2], y + 3);
      doc.text("Evidence", cols[3], y + 3);
      doc.text("Days", cols[4], y + 3);
      y += 12;

      capaItems.forEach((item: any, idx: number) => {
        y = checkPageBreak(y, 10);
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 4, contentWidth, 8, "F");
        }
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray600);
        doc.text(String(item.priority || idx + 1), cols[0], y + 1);
        doc.text((item.domain || "").substring(0, 20), cols[1], y + 1);
        const actionLines = doc.splitTextToSize(item.requiredAction || item.action || "", 38);
        doc.text(actionLines[0] || "", cols[2], y + 1);
        const evidLines = doc.splitTextToSize(item.evidenceRequired || item.evidence || "", 35);
        doc.text(evidLines[0] || "", cols[3], y + 1);
        doc.text(String(item.timelineDays || item.timeline || ""), cols[4], y + 1);
        y += 8;
      });
      y += 6;
    }

    if (narrative.reevaluationClause) {
      y = drawSectionTitle("RE-EVALUATION CLAUSE", y);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray600);
      const lines = doc.splitTextToSize(narrative.reevaluationClause, contentWidth - 10);
      y = checkPageBreak(y, lines.length * 5);
      doc.text(lines, margin + 7, y);
      y += lines.length * 5 + 8;
    }

    y = drawSectionTitle("INTEGRITY VERIFICATION", y);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray600);
    doc.text(`SHA-256 Hash: ${report.sha256Hash || "N/A"}`, margin + 7, y);
    y += 6;
    doc.text(`Locked: ${report.locked ? "Yes" : "No"}`, margin + 7, y);
    y += 6;
    doc.text(`Generated By: ${report.generatedByName || "N/A"}`, margin + 7, y);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawHeader(i, pageCount);
      drawFooter();
    }

    const siteName = site?.contactName || `Site_${report.siteId}`;
    doc.save(`Innova_Report_${siteName.replace(/[^a-z0-9]/gi, "_")}_${report.reportVersion || "v1"}.pdf`);

    toast({ title: "PDF Downloaded", description: "Report PDF has been generated successfully." });
  };

  if (reportLoading || !report) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin/reports")}
            className="pl-0 hover:pl-2 transition-all"
            data-testid="button-back-reports"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
          </Button>
          <Button onClick={handleDownloadPDF} data-testid="button-download-pdf">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Cover Section */}
        <Card data-testid="section-cover">
          <div
            className="rounded-t-lg p-8 text-white"
            style={{ background: "linear-gradient(135deg, #0066a1 0%, #00857c 100%)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-report-title">
                  Site Evaluation Report
                </h1>
                <p className="text-white/80 text-sm">Innova Trials LLC</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Report Version</p>
                <p className="font-semibold" data-testid="text-report-version">{report.reportVersion || "v1"}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Site</p>
                <p className="font-semibold" data-testid="text-site-name">{site?.contactName || `Site #${report.siteId}`}</p>
                <p className="text-white/70 text-xs">{site?.location || ""}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Generated</p>
                <p className="font-semibold" data-testid="text-generated-date">
                  {report.generatedAt
                    ? new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Final Status</p>
              {getFinalStatusBadge(report.finalStatus)}
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        {narrative.executiveSummary && (
          <Card data-testid="section-executive-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0066a1]">
                <FileText className="h-5 w-5" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="text-executive-summary">
                {narrative.executiveSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Domain Evaluation */}
        {domainEvaluations.length > 0 && (
          <Card data-testid="section-domain-evaluation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0066a1]">
                <Shield className="h-5 w-5" /> Domain Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainEvaluations.map((d: any, idx: number) => (
                    <TableRow key={idx} data-testid={`row-domain-${idx}`}>
                      <TableCell className="font-medium">{d.displayName || d.domain || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(d.statusLabel)} text-white`} data-testid={`badge-domain-status-${idx}`}>
                          {d.statusLabel || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Critical Gaps */}
        {criticalGaps.length > 0 && (
          <Card data-testid="section-critical-gaps">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Critical Gaps (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {criticalGaps.map((d: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-3" data-testid={`item-gap-${idx}`}>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{d.displayName || d.domain || "Unknown"}</span>
                    </div>
                    <Badge className={`${getStatusColor(d.statusLabel)} text-white`}>
                      {d.statusLabel || "N/A"}
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* CAPA Plan */}
        {capaItems.length > 0 && (
          <Card data-testid="section-capa-plan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0066a1]">
                <CheckCircle2 className="h-5 w-5" /> CAPA Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Required Action</TableHead>
                    <TableHead>Evidence Required</TableHead>
                    <TableHead>Timeline (days)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capaItems.map((item: any, idx: number) => (
                    <TableRow key={idx} data-testid={`row-capa-${idx}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">{item.priority || idx + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.domain || "N/A"}</TableCell>
                      <TableCell>{item.requiredAction || item.action || "N/A"}</TableCell>
                      <TableCell>{item.evidenceRequired || item.evidence || "N/A"}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.timelineDays || item.timeline || "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Re-evaluation Clause */}
        {narrative.reevaluationClause && (
          <Card data-testid="section-reevaluation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0066a1]">
                <Clock className="h-5 w-5" /> Re-evaluation Clause
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="text-reevaluation-clause">
                {narrative.reevaluationClause}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Integrity Verification */}
        <Card data-testid="section-integrity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0066a1]">
              <Shield className="h-5 w-5" /> Integrity Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">SHA-256 Hash</p>
                <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded block mt-1" data-testid="text-sha256-hash">
                  {report.sha256Hash || "N/A"}
                </code>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              {report.locked ? (
                <Lock className="h-5 w-5 text-emerald-600" />
              ) : (
                <Unlock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Lock Status</p>
                <p className="font-medium" data-testid="text-lock-status">
                  {report.locked ? "Locked — Report is immutable" : "Unlocked — Awaiting acknowledgment"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Generated By</p>
                <p className="font-medium" data-testid="text-generated-by">{report.generatedByName || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment Section */}
        {!report.locked && (
          <Card className="border-amber-300 bg-amber-50" data-testid="section-acknowledgment">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" /> Acknowledgment Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-amber-800">
                This report has not been acknowledged yet. By clicking the button below, you confirm
                that you have reviewed the report and accept its contents. Your signature and the
                SHA-256 hash will be recorded.
              </p>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-muted-foreground">Report Hash for Verification:</p>
                <code className="text-xs font-mono" data-testid="text-ack-hash">{report.sha256Hash}</code>
              </div>
              <Button
                onClick={handleAcknowledge}
                disabled={acknowledging || acknowledgeMutation.isPending}
                className="bg-[#0066a1] hover:bg-[#005080]"
                data-testid="button-acknowledge"
              >
                {acknowledging || acknowledgeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                I Acknowledge
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Signatures */}
        <Card data-testid="section-signatures">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0066a1]">
              <CheckCircle2 className="h-5 w-5" /> Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signatures.length > 0 ? (
              <div className="space-y-3">
                {signatures.map((sig: any, idx: number) => (
                  <div
                    key={sig.id || idx}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border"
                    data-testid={`item-signature-${idx}`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{sig.signedByName}</p>
                      <p className="text-xs text-muted-foreground">
                        {sig.signedByRole} — {sig.signedAt ? new Date(sig.signedAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <code className="text-xs font-mono text-muted-foreground">
                      {sig.hashVerification ? sig.hashVerification.substring(0, 12) + "..." : ""}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-signatures">
                <XCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No signatures recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}