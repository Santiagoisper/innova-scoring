import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { fetchSites, fetchStats } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Users, FileText, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight, Loader2, Clock, Radio } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useStore();
  const [, setLocation] = useLocation();
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["/api/sites"], queryFn: fetchSites, refetchInterval: 10000 });
  const { data: stats } = useQuery({ queryKey: ["/api/stats"], queryFn: fetchStats, refetchInterval: 10000 });

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

  const totalSites = sites.length;
  const pendingSites = sites.filter((s: any) => s.status === "Pending").length;
  const approvedSites = sites.filter((s: any) => s.status === "Approved").length;
  const rejectedSites = sites.filter((s: any) => s.status === "Rejected").length;
  const toConsiderSites = sites.filter((s: any) => s.status === "ToConsider").length;
  
  const approvalRate = totalSites > 0 
    ? Math.round((approvedSites / (totalSites - pendingSites)) * 100) || 0 
    : 0;

  const evaluatedSites = sites.filter((s: any) => 
    s.score !== undefined && 
    s.status !== "Pending" && 
    s.status !== "TokenSent"
  );
  const rankedSites = [...evaluatedSites].sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).slice(0, 5);

  const statusData = [
    { name: 'Approved', value: approvedSites, color: 'hsl(var(--chart-3))' },
    { name: 'Conditional', value: toConsiderSites, color: 'hsl(var(--chart-4))' },
    { name: 'Rejected', value: rejectedSites, color: 'hsl(var(--chart-5))' },
  ];

  const countryCounts = sites.reduce((acc: Record<string, number>, site: any) => {
    const country = site.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 5);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Overview Dashboard</h1>
            <p className="text-muted-foreground">Monitor site registration, evaluation progress, and network quality.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </div>
            <Button onClick={() => setLocation("/admin/centers")}>
              View All Centers
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div data-testid="text-total-registrations" className="text-2xl font-bold">{totalSites}</div>
              <p className="text-xs text-muted-foreground">Across all regions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div data-testid="text-pending-review" className="text-2xl font-bold">{pendingSites}</div>
              <p className="text-xs text-muted-foreground">Awaiting tokens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div data-testid="text-approval-rate" className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">Of evaluated sites</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Network Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div data-testid="text-avg-network-score" className="text-2xl font-bold">
                {evaluatedSites.length > 0 
                  ? Math.round(evaluatedSites.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / evaluatedSites.length) 
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Benchmarked globally</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div data-testid="text-avg-response-time" className="text-2xl font-bold">
                {stats?.avgResponseTimeDays != null ? `${stats.avgResponseTimeDays}d` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Token to completion</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Rated Sites */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Rated Sites</CardTitle>
              <CardDescription>Highest performing centers based on evaluation criteria.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankedSites.map((site: any, i: number) => (
                  <div key={site.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setLocation(`/admin/centers/${site.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{site.contactName}</p>
                        <p className="text-xs text-muted-foreground">{site.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StarRating score={site.score || 0} />
                      <span className="text-sm font-bold text-primary">{site.score}%</span>
                    </div>
                  </div>
                ))}
                {rankedSites.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No evaluated sites yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Decision Breakdown</CardTitle>
              <CardDescription>Status of processed applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {statusData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/centers")}>
                Review Pending <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Top Countries */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Top 5 Countries by Sites</CardTitle>
              <CardDescription>Highest concentration of research centers globally.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
