import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { seedDatabase } from "@/lib/api";
import { Chatbot } from "@/components/chatbot";

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
import InvoicingPage from "@/pages/invoicing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login/admin" component={AdminLogin} />
      <Route path="/login/site" component={SiteLogin} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/centers" component={AdminCenters} />
      <Route path="/admin/centers/:id" component={CenterDetail} />
      <Route path="/admin/evaluation-setup" component={EvaluationSetup} />
      <Route path="/admin/export" component={ExportResults} />
      <Route path="/admin/contact-requests" component={ContactRequests} />
      <Route path="/admin/activity-log" component={ActivityLog} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Site Routes */}
      <Route path="/site/disclaimer" component={SiteDisclaimer} />
      <Route path="/site/evaluation" component={SiteEvaluation} />
      <Route path="/facturacion" component={InvoicingPage} />
      
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
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
