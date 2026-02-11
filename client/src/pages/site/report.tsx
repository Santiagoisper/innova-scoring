import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { fetchReportsBySiteId, fetchReport, fetchReportSignatures, acknowledgeReport } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Lock, Unlock, CheckCircle2, AlertTriangle, Hash, Clock, ArrowLeft } from "lucide-react";

export default function SiteReport() {
  const { user } = useStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const siteId = user?.siteId;

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports/site", siteId],
    queryFn: () => fetchReportsBySiteId(siteId!),
    enabled: !!siteId,
  });

  const { data: selectedReport } = useQuery({
    queryKey: ["/api/reports", selectedReportId],
    queryFn: () => fetchReport(selectedReportId!),
    enabled: !!selectedReportId,
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ["/api/reports/signatures", selectedReportId],
    queryFn: () => fetchReportSignatures(selectedReportId!),
    enabled: !!selectedReportId,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: () => acknowledgeReport(selectedReportId!, {
      signedByName: user?.name || "Site Representative",
      signedByRole: "site",
      hashVerification: selectedReport?.hashSha256 || selectedReport?.hash_sha256 || "",
    }),
    onSuccess: () => {
      toast({ title: "Report Acknowledged", description: "The report has been locked and your acknowledgment recorded." });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/signatures"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!user || user.role !== "site") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p>Please log in as a site to view reports.</p>
            <Button className="mt-4" onClick={() => navigate("/login/site")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const report = selectedReport;
  const narrative = report?.narrativeSnapshotJson || report?.narrative_snapshot_json;
  const scoreSnapshot = report?.scoreSnapshotJson || report?.score_snapshot_json;
  const capaItems = report?.capaItemsJson || report?.capa_items_json || [];
  const hash = report?.hashSha256 || report?.hash_sha256;
  const isLocked = report?.isLocked ?? report?.is_locked ?? false;
  const domainEvals = scoreSnapshot?.domainEvaluations || [];

  const statusColor = (label: string) => {
    if (label === "Adequate") return "bg-emerald-100 text-emerald-800";
    if (label === "Partially Adequate") return "bg-amber-100 text-amber-800";
    if (label === "Critical Gap") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const finalStatusColor = (status: string) => {
    if (status === "Approved") return "bg-emerald-500";
    if (status === "Conditionally Approved") return "bg-amber-500";
    return "bg-red-500";
  };

  if (!selectedReportId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#0066a1] to-[#00857c] text-white p-6">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="text-white mb-2" onClick={() => navigate("/site/evaluation")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Evaluation Reports</h1>
            <p className="text-white/80 mt-1">View your institutional evaluation reports</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No reports have been generated yet.</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((r: any) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReportId(r.id)} data-testid={`report-card-${r.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{r.reportVersion || r.report_version}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(r.generatedAtUtc || r.generated_at_utc).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${finalStatusColor(r.finalStatus || r.final_status)} text-white`}>
                        {r.finalStatus || r.final_status}
                      </Badge>
                      {(r.isLocked ?? r.is_locked) ? (
                        <Lock className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0066a1] to-[#00857c] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="text-white mb-2" onClick={() => setSelectedReportId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Reports
          </Button>
          <h1 className="text-2xl font-bold">{report?.reportVersion || report?.report_version}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`${finalStatusColor(report?.finalStatus || report?.final_status || "")} text-white`}>
              {report?.finalStatus || report?.final_status}
            </Badge>
            {isLocked ? (
              <span className="flex items-center gap-1 text-sm"><Lock className="h-4 w-4" /> Locked</span>
            ) : (
              <span className="flex items-center gap-1 text-sm"><Unlock className="h-4 w-4" /> Pending Acknowledgment</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {narrative?.executiveSummary && (
          <Card>
            <CardHeader><CardTitle className="text-[#0066a1]">Executive Summary</CardTitle></CardHeader>
            <CardContent><p className="text-gray-700 leading-relaxed">{narrative.executiveSummary}</p></CardContent>
          </Card>
        )}

        {domainEvals.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-[#0066a1]">Domain Evaluation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domainEvals.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0" data-testid={`domain-eval-${d.domainKey}`}>
                    <span className="font-medium text-sm">{d.displayName}</span>
                    <Badge className={statusColor(d.statusLabel)}>{d.statusLabel}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {domainEvals.some((d: any) => d.statusLabel === "Critical Gap" || d.statusLabel === "Not Evidenced") && (
          <Card className="border-red-200">
            <CardHeader><CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Critical Gaps</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domainEvals
                  .filter((d: any) => d.statusLabel === "Critical Gap" || d.statusLabel === "Not Evidenced")
                  .slice(0, 5)
                  .map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm">{d.displayName}</span>
                      <Badge className={statusColor(d.statusLabel)}>{d.statusLabel}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {capaItems.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader><CardTitle className="text-amber-700">CAPA Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Domain</th>
                      <th className="px-3 py-2 text-left">Required Action</th>
                      <th className="px-3 py-2 text-left">Evidence Required</th>
                      <th className="px-3 py-2 text-left">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capaItems.map((item: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2 font-medium">{item.priority}</td>
                        <td className="px-3 py-2">{item.domainName}</td>
                        <td className="px-3 py-2">{item.requiredAction}</td>
                        <td className="px-3 py-2">{item.evidenceRequired}</td>
                        <td className="px-3 py-2">{item.timelineDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {narrative?.reevaluationClause && (
          <Card>
            <CardHeader><CardTitle className="text-[#0066a1]">Re-evaluation Clause</CardTitle></CardHeader>
            <CardContent><p className="text-gray-700 leading-relaxed">{narrative.reevaluationClause}</p></CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-[#0066a1] flex items-center gap-2"><Shield className="h-5 w-5" /> Integrity Verification</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-mono bg-gray-100 p-2 rounded break-all flex-1">{hash}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {isLocked ? (
                  <><Lock className="h-4 w-4 text-amber-600" /><span className="text-amber-700 font-medium">Report Locked — Immutable</span></>
                ) : (
                  <><Unlock className="h-4 w-4 text-gray-400" /><span className="text-gray-600">Report Unlocked — Pending Acknowledgment</span></>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {signatures.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-[#0066a1]">Signatures</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signatures.map((sig: any) => (
                  <div key={sig.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{sig.signedByName || sig.signed_by_name}</p>
                      <p className="text-xs text-gray-500">{sig.signedByRole || sig.signed_by_role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(sig.signedAtUtc || sig.signed_at_utc).toLocaleString()}</p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isLocked && (
          <Card className="border-[#0066a1]">
            <CardHeader><CardTitle className="text-[#0066a1]">Acknowledge Report</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                By clicking "I Acknowledge", you confirm that you have reviewed this report and accept its contents.
                The report will be locked and become immutable.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                SHA-256 Hash: <span className="font-mono">{hash?.substring(0, 16)}...</span>
              </p>
              <Button
                onClick={() => acknowledgeMutation.mutate()}
                disabled={acknowledgeMutation.isPending}
                className="bg-[#0066a1] hover:bg-[#005080]"
                data-testid="btn-acknowledge"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {acknowledgeMutation.isPending ? "Processing..." : "I Acknowledge"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
