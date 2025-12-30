import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch, SearchTrigger } from "./GlobalSearch";
import { useSecurityAlertNotifications } from "@/hooks/useSecurityAlertNotifications";
import { useSDRAlertNotifications } from "@/hooks/useSDRAlertNotifications";
import { CelebrationOverlayProvider } from "@/components/gamification/CelebrationOverlayProvider";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Enable real-time security alert notifications for admins/managers
  useSecurityAlertNotifications();
  
  // Enable real-time SDR alert notifications for admins/managers
  useSDRAlertNotifications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Hide sidebar on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <main className={cn(
          "flex-1 relative",
          isMobile && "pb-20" // Space for bottom nav
        )}>
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="glass h-9 w-9 hover:bg-muted/50 hover-scale-lg hidden md:flex" />
            </div>
            <div className="flex items-center gap-2">
              <SearchTrigger onClick={() => setSearchOpen(true)} />
              <ThemeToggle />
            </div>
          </div>
          <GlobalSearch />
          {children}
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileNavigation />
        
        {/* Global celebration overlays */}
        <CelebrationOverlayProvider />
      </div>
    </SidebarProvider>
  );
}
