import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Settings, User, LogOut, BarChart3 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/application", label: "New Application", icon: FileText },
    { href: "/history", label: "History", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              IS
            </div>
            Innova Scoring
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Admin User</span>
            <LogOut className="ml-auto h-4 w-4 hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6 shadow-sm">
          <h1 className="text-lg font-semibold md:text-xl">
            {navItems.find(i => i.href === location)?.label || "Overview"}
          </h1>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
