import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Users, FileText, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { sites, user } = useStore();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    // Basic protection
    return <div className="p-4">Access Denied</div>;
  }

  // Calculate Metrics
  const totalSites = sites.length;
  const pendingSites = sites.filter(s => s.status === "Pending").length;
  const approvedSites = sites.filter(s => s.status === "Approved").length;
  const rejectedSites = sites.filter(s => s.status === "Rejected").length;
  const toConsiderSites = sites.filter(s => s.status === "ToConsider").length;
  
  const approvalRate = totalSites > 0 
    ? Math.round((approvedSites / (totalSites - pendingSites)) * 100) || 0 
    : 0;

  // Prepare Rankings
  // Filter only evaluated sites
  const evaluatedSites = sites.filter(s => s.score !== undefined);
  const rankedSites = [...evaluatedSites].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

  // Status Distribution Data
  const statusData = [
    { name: 'Approved', value: approvedSites, color: 'hsl(var(--chart-3))' }, // Green
    { name: 'Conditional', value: toConsiderSites, color: 'hsl(var(--chart-4))' }, // Orange
    { name: 'Rejected', value: rejectedSites, color: 'hsl(var(--chart-5))' }, // Red
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Overview Dashboard</h1>
            <p className="text-muted-foreground">Monitor site registration, evaluation progress, and network quality.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation("/admin/centers")}>
              View All Centers
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSites}</div>
              <p className="text-xs text-muted-foreground">Across all regions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSites}</div>
              <p className="text-xs text-muted-foreground">Awaiting tokens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">Of evaluated sites</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Network Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluatedSites.length > 0 
                  ? Math.round(evaluatedSites.reduce((acc, s) => acc + (s.score || 0), 0) / evaluatedSites.length) 
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Benchmarked globally</p>
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
                {rankedSites.map((site, i) => (
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
        </div>
      </div>
    </Layout>
  );
}
