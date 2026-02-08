import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Shield, FileText, Settings, AlertTriangle } from "lucide-react";

// Mock Activity Data
const ACTIVITY_LOG = [
  { id: 1, user: "Admin User", action: "Approved Site", target: "Boston General Hospital", date: "2023-10-25 14:30", type: "success" },
  { id: 2, user: "System", action: "Token Generated", target: "Miami Research Center", date: "2023-10-25 11:15", type: "info" },
  { id: 3, user: "Dr. Sarah Chen", action: "Submitted Evaluation", target: "Oncology Unit A", date: "2023-10-24 09:45", type: "warning" },
  { id: 4, user: "Admin User", action: "Login", target: "Admin Portal", date: "2023-10-24 08:00", type: "info" },
  { id: 5, user: "System", action: "Failed Login Attempt", target: "IP: 192.168.1.45", date: "2023-10-23 23:12", type: "error" },
];

export default function ActivityLog() {
  const getIcon = (type: string) => {
    switch(type) {
      case "success": return <Shield className="h-4 w-4 text-green-600" />;
      case "warning": return <FileText className="h-4 w-4 text-amber-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">System Activity Log</h1>
            <p className="text-muted-foreground">Audit trail of all actions performed within the platform.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Displaying last 50 system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full pr-4">
              <div className="space-y-6">
                {ACTIVITY_LOG.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center bg-muted/50 border`}>
                      {getIcon(log.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          <span className="font-bold text-primary mr-2">{log.user}</span>
                          {log.action}
                        </p>
                        <span className="text-xs text-muted-foreground">{log.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded-md inline-block">
                        {log.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
