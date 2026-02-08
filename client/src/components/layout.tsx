import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Home, Building2, ClipboardCheck } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const isAdmin = user?.role === "admin";
  const isSite = user?.role === "site";

  return (
    <div className="min-h-screen bg-muted/20 font-sans flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation(user ? (isAdmin ? "/admin" : "/site/disclaimer") : "/")}>
            {/* Logo Placeholder */}
            <div className="h-8 w-8 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
              <span className="font-heading font-bold text-white text-lg">I</span>
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight">Innova Trials</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {isAdmin && (
              <>
                <Link href="/admin">
                  <a className={`flex items-center gap-2 hover:text-white/80 transition-colors ${location === "/admin" ? "text-white" : "text-white/60"}`}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </a>
                </Link>
                <Link href="/admin/centers">
                  <a className={`flex items-center gap-2 hover:text-white/80 transition-colors ${location.startsWith("/admin/centers") ? "text-white" : "text-white/60"}`}>
                    <Building2 className="h-4 w-4" /> Centers
                  </a>
                </Link>
              </>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                <span className="text-xs text-white/70">
                  {user.name} ({isAdmin ? "Admin" : "Site"})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10 hover:text-white">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/">
                  <a className="text-white/80 hover:text-white">Home</a>
                </Link>
                <Link href="/register">
                  <a className="text-white/80 hover:text-white">Register Site</a>
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

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Innova Trials. Clinical Research Organization.</p>
        </div>
      </footer>
    </div>
  );
}
