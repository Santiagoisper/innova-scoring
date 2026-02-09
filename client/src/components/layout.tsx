import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Building2, ClipboardCheck, MessageSquare, Activity, Settings } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const isAdmin = user?.role === "admin";
  const isAdminRoute = location.startsWith("/admin");

  if (isAdmin && isAdminRoute) {
    return (
      <div className="flex min-h-screen bg-muted/20 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-primary-foreground flex flex-col fixed inset-y-0 left-0 z-50">
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/admin")}>
              <div className="h-8 w-8 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
                <span className="font-heading font-bold text-white text-lg">I</span>
              </div>
              <span className="font-heading font-semibold text-xl tracking-tight">Innova Trials LLC</span>
            </div>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1">
            <Link href="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/admin" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/centers" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/centers") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Centers</span>
            </Link>
            <Link href="/admin/evaluation-setup" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/evaluation-setup") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <Settings className="h-5 w-5" />
              <span className="font-medium">Evaluation Setup</span>
            </Link>
            <Link href="/admin/export" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/export") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <ClipboardCheck className="h-5 w-5" />
              <span className="font-medium">Export Results</span>
            </Link>
            <Link href="/admin/contact-requests" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/contact-requests") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Contact Requests</span>
            </Link>
            <Link href="/admin/activity-log" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/activity-log") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <Activity className="h-5 w-5" />
              <span className="font-medium">Activity Log</span>
            </Link>
            <Link href="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location.startsWith("/admin/settings") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}>
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="font-bold text-xs">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                   <p className="text-xs text-white/50 truncate capitalize">{user.role}</p>
                   {user.permission === "readonly" && <span className="text-[10px] bg-white/10 px-1 rounded text-white/70">Read Only</span>}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 flex flex-col min-h-screen">
          <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm sticky top-0 z-40">
            <h1 className="text-xl font-semibold text-gray-800">
              {location === "/admin" ? "Dashboard" : 
               location.startsWith("/admin/centers") ? "Centers Management" :
               location.startsWith("/admin/evaluation-setup") ? "Evaluation Setup" :
               location.startsWith("/admin/export") ? "Export Data" :
               location.startsWith("/admin/contact-requests") ? "Contact Requests" :
               location.startsWith("/admin/activity-log") ? "Activity Log" : "Admin Portal"}
            </h1>
          </header>
          <div className="flex-1 p-0">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Default Layout for Non-Admin (Site / Public)
  return (
    <div className="min-h-screen bg-muted/20 font-sans flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="h-8 w-8 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
              <span className="font-heading font-bold text-white text-lg">I</span>
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight">Innova Trials LLC</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                <span className="text-xs text-white/70">
                  {user.name} ({user.role === "site" ? "Site" : "User"})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10 hover:text-white">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/" className="text-white/80 hover:text-white">
                  Home
                </Link>
                <Link href="/register" className="text-white/80 hover:text-white">
                  Register Site
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer - Hide on Home page as it has a custom footer */}
      {location !== "/" && (
        <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
          <div className="container mx-auto">
            <p>© {new Date().getFullYear()} Innova Trials LLC. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
