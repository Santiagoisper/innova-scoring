import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Shield, FileText, Settings, AlertTriangle, Layers } from "lucide-react";

export default function ActivityLog() {
  const { activityLog, clearActivityLog, user } = useStore();

  const getIcon = (type: string) => {
    switch(type) {
      case "success": return <Shield className="h-4 w-4 text-green-600" />;
      case "warning": return <FileText className="h-4 w-4 text-amber-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "info": return <Layers className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear the system logs?")) {
      clearActivityLog();
    }
  };

  const canClear = user?.permission === 'readwrite';

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary relative flex items-center gap-2">
              System Activity Log
              {canClear && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-destructive hover:text-white transition-colors ml-2"
                  onClick={handleClearLogs}
                >
                  Clear Logs
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Audit trail of all actions performed within the platform.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Displaying last {activityLog.length} system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full pr-4">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-50">
                  <Activity className="h-12 w-12 mb-4" />
                  <p>No activity logs found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activityLog.map((log) => (
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground bg-muted/20 p-1 px-2 rounded-md inline-block">
                            {log.target}
                          </p>
                          {log.sector && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {log.sector}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
