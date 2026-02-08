import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/star-rating";
import { ArrowLeft, Mail, MapPin, Calendar, FileText, Download, File } from "lucide-react";
import { QUESTIONS } from "@/lib/questions";

export default function CenterDetail() {
  const [, params] = useRoute("/admin/centers/:id");
  const { sites, questions } = useStore();
  const [, setLocation] = useLocation();
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    if (params?.id) {
      const found = sites.find(s => s.id === params.id);
      setSite(found);
    }
  }, [params?.id, sites]);

  if (!site) return <div className="p-8">Loading...</div>;

  // Use dynamic questions list if available, otherwise fallback to default
  const questionsList = questions || QUESTIONS;

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
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {site.email}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {site.location || "N/A"}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Registered: {new Date(site.registeredAt).toLocaleDateString()}</span>
            </div>
          </div>
          
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
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
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
                <CardHeader>
                  <CardTitle>Evaluation Responses</CardTitle>
                  <CardDescription>Detailed questionnaire results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questionsList.map((q) => {
                    const answerEntry = site.answers[q.id];
                    if (!answerEntry) return null;
                    
                    // Handle new structure vs old structure
                    let answerValue = "";
                    let attachment = null;
                    
                    if (typeof answerEntry === 'object' && answerEntry !== null && 'value' in answerEntry) {
                      answerValue = answerEntry.value;
                      attachment = answerEntry.attachment;
                    } else {
                      answerValue = answerEntry as string;
                    }
                    
                    return (
                      <div key={q.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <p className="font-medium text-sm mb-2">{q.text}</p>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-2 flex-1">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                              answerValue === "Yes" ? "bg-green-100 text-green-800" :
                              answerValue === "No" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {answerValue}
                            </div>
                            {/* Attachment Display */}
                            {attachment && (
                              <div className="flex items-center gap-2 mt-1 bg-muted/30 p-2 rounded border w-fit">
                                <File className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{attachment.name}</span>
                                <Badge variant="outline" className="text-[10px] h-5">{attachment.type.split('/')[1] || 'file'}</Badge>
                              </div>
                            )}
                          </div>
                          
                          {q.weight > 0 && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Weight: {q.weight}</span>
                          )}
                        </div>
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
