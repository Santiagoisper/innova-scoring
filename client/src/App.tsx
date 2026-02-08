import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Register from "@/pages/register";
import AdminLogin from "@/pages/admin-login";
import SiteLogin from "@/pages/site-login";
import AdminDashboard from "@/pages/admin/dashboard.tsx";
import AdminCenters from "@/pages/admin/centers.tsx";
import CenterDetail from "@/pages/admin/center-detail.tsx";
import SiteDisclaimer from "@/pages/site/disclaimer.tsx";
import SiteEvaluation from "@/pages/site/evaluation.tsx";

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

      {/* Site Routes */}
      <Route path="/site/disclaimer" component={SiteDisclaimer} />
      <Route path="/site/evaluation" component={SiteEvaluation} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
