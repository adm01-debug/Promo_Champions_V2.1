import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch, SearchTrigger } from "./GlobalSearch";
import { Search } from "lucide-react";
import { useSecurityAlertNotifications } from "@/hooks/useSecurityAlertNotifications";
import { useSDRAlertNotifications } from "@/hooks/useSDRAlertNotifications";
import { useRealtimeCelebrations } from "@/hooks/useRealtimeCelebrations";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Enable real-time security alert notifications for admins/managers
  useSecurityAlertNotifications();
  
  // Enable real-time SDR alert notifications for admins/managers
  useSDRAlertNotifications();
  
  // Enable real-time celebrations for level-ups and achievements
  useRealtimeCelebrations();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="glass h-9 w-9 hover:bg-muted/50 hover-scale-lg" />
            </div>
            <div className="flex items-center gap-2">
              <SearchTrigger onClick={() => setSearchOpen(true)} />
              <ThemeToggle />
            </div>
          </div>
          <GlobalSearch />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
