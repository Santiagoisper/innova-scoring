import { useEffect, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { seedDatabase } from "@/lib/api";
import { useStore } from "@/lib/store";

// Pages
import Home from "@/pages/home";
import Register from "@/pages/register";
import AdminLogin from "@/pages/admin-login";
import SiteLogin from "@/pages/site-login";
import AdminDashboard from "@/pages/admin/dashboard.tsx";
import AdminCenters from "@/pages/admin/centers.tsx";
import CenterDetail from "@/pages/admin/center-detail.tsx";
import EvaluationSetup from "@/pages/admin/evaluation-setup.tsx";
import SiteDisclaimer from "@/pages/site/disclaimer.tsx";
import SiteEvaluation from "@/pages/site/evaluation.tsx";
import ExportResults from "@/pages/admin/export.tsx";
import ContactRequests from "@/pages/admin/contact-requests.tsx";
import ActivityLog from "@/pages/admin/activity-log.tsx";
import AdminSettings from "@/pages/admin/settings.tsx";
import ReportConfig from "@/pages/admin/report-config.tsx";
import AdminReports from "@/pages/admin/reports.tsx";
import ReportDetail from "@/pages/admin/report-detail.tsx";
import SiteReport from "@/pages/site/report.tsx";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.role !== "admin") {
      setLocation("/login/admin");
    }
  }, [user, setLocation]);

  if (user?.role !== "admin") return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login/admin" component={AdminLogin} />
      <Route path="/login/site" component={SiteLogin} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/centers">
        {() => (
          <RequireAdmin>
            <AdminCenters />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/centers/:id">
        {() => (
          <RequireAdmin>
            <CenterDetail />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/evaluation-setup">
        {() => (
          <RequireAdmin>
            <EvaluationSetup />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/export">
        {() => (
          <RequireAdmin>
            <ExportResults />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/contact-requests">
        {() => (
          <RequireAdmin>
            <ContactRequests />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/activity-log">
        {() => (
          <RequireAdmin>
            <ActivityLog />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <RequireAdmin>
            <AdminSettings />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/report-config">
        {() => (
          <RequireAdmin>
            <ReportConfig />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/reports">
        {() => (
          <RequireAdmin>
            <AdminReports />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/reports/:id">
        {() => (
          <RequireAdmin>
            <ReportDetail />
          </RequireAdmin>
        )}
      </Route>

      {/* Site Routes */}
      <Route path="/site/disclaimer" component={SiteDisclaimer} />
      <Route path="/site/evaluation" component={SiteEvaluation} />
      <Route path="/site/report" component={SiteReport} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    seedDatabase().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
