import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScoreGauge } from "@/components/score-gauge";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Download, Share2, ArrowLeft } from "lucide-react";

export default function ResultPage() {
  const [, params] = useRoute("/result/:id");
  const [, setLocation] = useLocation();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (params?.id) {
      const history = JSON.parse(localStorage.getItem("innova_history") || "[]");
      const found = history.find((h: any) => h.id === params.id);
      setData(found);
    }
  }, [params?.id]);

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <p>Loading result...</p>
        </div>
      </Layout>
    );
  }

  const { result } = data;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <Card className="md:col-span-2 border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Credit Assessment Result</CardTitle>
                  <CardDescription>Generated on {new Date(data.date).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  ID: {data.id.slice(-6)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                <div className="w-full max-w-[250px]">
                  <ScoreGauge score={result.score} />
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Assessment Status</h3>
                    <div className={`text-3xl font-bold flex items-center justify-center md:justify-start gap-2 ${
                      result.status === "Approved" ? "text-emerald-600" : 
                      result.status === "Rejected" ? "text-red-600" : "text-amber-600"
                    }`}>
                      {result.status === "Approved" && <CheckCircle2 className="h-8 w-8" />}
                      {result.status === "Rejected" && <XCircle className="h-8 w-8" />}
                      {result.status === "Review" && <AlertTriangle className="h-8 w-8" />}
                      {result.status}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Based on the provided information, the applicant has a 
                      <strong className="text-foreground"> {result.riskLevel} risk profile</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Recommended Interest Rate</h4>
                  <p className="text-2xl font-bold text-foreground">{result.interestRate}%</p>
                  <p className="text-xs text-muted-foreground">Fixed Annual Percentage Rate</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Max Loan Eligibility</h4>
                  <p className="text-2xl font-bold text-foreground">${result.maxLoanAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Based on debt-to-income ratio</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end gap-2 p-4">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Report PDF
              </Button>
            </CardFooter>
          </Card>

          {/* Applicant Details Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Applicant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                <p className="font-medium">{data.name}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Assessment Date</p>
                <p className="font-medium">{new Date(data.date).toLocaleString()}</p>
              </div>
              <Separator />
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This report is valid for 30 days from the date of issuance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
