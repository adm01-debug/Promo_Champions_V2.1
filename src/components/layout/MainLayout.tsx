import { useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch, GlobalSearchHandle, SearchTrigger } from "./GlobalSearch";
import { useSecurityAlertNotifications } from "@/hooks/useSecurityAlertNotifications";
import { useSDRAlertNotifications } from "@/hooks/useSDRAlertNotifications";
import { CelebrationOverlayProvider } from "@/components/gamification/CelebrationOverlayProvider";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SkipLinks } from "@/components/a11y/SkipLinks";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const searchRef = useRef<GlobalSearchHandle>(null);
  const { currentPageInfo } = useMobileNavigation();
  
  // Enable real-time security alert notifications for admins/managers
  useSecurityAlertNotifications();
  
  // Enable real-time SDR alert notifications for admins/managers
  useSDRAlertNotifications();

  return (
    <SidebarProvider>
      {/* Skip Links for Accessibility */}
      <SkipLinks />
      
      <div className="min-h-screen flex w-full">
        {/* Hide sidebar on mobile */}
        <nav id="main-navigation" className="hidden md:block" aria-label="Navegação principal">
          <AppSidebar />
        </nav>
        
        <main 
          id="main-content" 
          className={cn(
            "flex-1 relative flex flex-col",
            isMobile && "pb-20"
          )}
          role="main"
          aria-label="Conteúdo principal"
        >
          {/* Mobile Header with back navigation */}
          <MobilePageHeader 
            title={currentPageInfo.title}
            subtitle={currentPageInfo.subtitle}
            rightAction={
              <div className="flex items-center gap-1">
                <SearchTrigger onClick={() => searchRef.current?.open()} />
                <ThemeToggle />
              </div>
            }
          />
          
          {/* Desktop Top Bar */}
          <div className="absolute top-4 left-4 right-4 z-50 items-center justify-between hidden md:flex">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="glass h-9 w-9 hover:bg-muted/50 hover-scale-lg" />
            </div>
            <div className="flex items-center gap-2">
              <SearchTrigger onClick={() => searchRef.current?.open()} />
              <ThemeToggle />
            </div>
          </div>
          
          <GlobalSearch ref={searchRef} />
          
          {/* Main content area */}
          <div className="flex-1">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileNavigation />
        
        {/* Global celebration overlays */}
        <CelebrationOverlayProvider />
      </div>
    </SidebarProvider>
  );
}
