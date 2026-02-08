import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/score-gauge";
import { ArrowRight, TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load mock history
    const stored = localStorage.getItem("innova_history");
    if (stored) {
      setHistory(JSON.parse(stored));
    } else {
      // Seed some data if empty
      const seedData = [
        { id: "1", date: new Date().toISOString(), name: "Maria Garcia", result: { score: 750, status: "Approved", riskLevel: "Low" } },
        { id: "2", date: new Date(Date.now() - 86400000).toISOString(), name: "Carlos Rodriguez", result: { score: 450, status: "Rejected", riskLevel: "High" } },
        { id: "3", date: new Date(Date.now() - 172800000).toISOString(), name: "Ana Silva", result: { score: 620, status: "Review", riskLevel: "Medium" } },
      ];
      localStorage.setItem("innova_history", JSON.stringify(seedData));
      setHistory(seedData);
    }
  }, []);

  const approvedCount = history.filter(h => h.result.status === "Approved").length;
  const avgScore = history.length ? Math.round(history.reduce((acc, curr) => acc + curr.result.score, 0) / history.length) : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Overview of recent credit assessments and performance.</p>
          </div>
          <Link href="/application">
            <Button className="shadow-lg shadow-primary/25">
              New Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}</div>
              <p className="text-xs text-muted-foreground">Moderate Risk Level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.length ? Math.round((approvedCount / history.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Within target range</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Flag</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.filter(h => h.result.riskLevel === "High").length}</div>
              <p className="text-xs text-muted-foreground">Requires manual review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest credit applications processed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        item.result.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                        item.result.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.result.score}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.result.status === "Approved" ? "default" : 
                        item.result.status === "Rejected" ? "destructive" : "secondary"
                      } className={
                         item.result.status === "Approved" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }>
                        {item.result.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/result/${item.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No records found. Start a new assessment.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats or Visualization */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Live metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">API Latency</span>
                     <span className="font-medium text-emerald-600">45ms</span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[15%]" />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Daily Limit Usage</span>
                     <span className="font-medium">1,240 / 5,000</span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[25%]" />
                   </div>
                </div>
                
                <div className="mt-8 p-4 bg-muted/40 rounded-lg border border-dashed">
                  <div className="text-sm font-medium mb-2">Algorithm Version</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v2.4.1</Badge>
                    <span className="text-xs text-muted-foreground">Updated 2 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
