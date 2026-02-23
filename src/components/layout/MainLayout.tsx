// @ts-nocheck
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
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { FocusModeToggle, FocusModeBreakReminder } from "@/components/focus/FocusModeToggle";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { InstallPrompt, UpdatePrompt, OfflineIndicator } from "@/components/pwa";
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
      {/* Offline indicator at top */}
      <OfflineIndicator />
      
      {/* Skip Links for Accessibility */}
      <SkipLinks />
      <div className="min-h-screen flex w-full bg-background">
        {/* Hide sidebar on mobile */}
        <nav id="main-navigation" className="hidden md:block" aria-label="Navegação principal">
          <AppSidebar />
        </nav>
        
        <main 
          id="main-content" 
          className={cn(
            "flex-1 relative flex flex-col bg-background",
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
              <FocusModeToggle />
              <Link to="/notificacoes" className="relative glass h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors">
                <Bell className="h-4 w-4" />
                <NotificationBadge count={3} position="top-right" size="sm" pulse />
              </Link>
              <SearchTrigger onClick={() => searchRef.current?.open()} />
              <ThemeToggle />
            </div>
          </div>
          
          <GlobalSearch ref={searchRef} />
          
          {/* Breadcrumbs - Desktop only */}
          <div className="hidden md:block pt-16 px-4 lg:px-8">
            <Breadcrumbs />
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileNavigation />
        
        {/* Global celebration overlays */}
        <CelebrationOverlayProvider />
        
        {/* Focus mode break reminder */}
        <FocusModeBreakReminder />
        
        {/* PWA Install Prompt */}
        <InstallPrompt variant="card" />
        
        {/* PWA Update Prompt */}
        <UpdatePrompt />
      </div>
    </SidebarProvider>
  );
}
