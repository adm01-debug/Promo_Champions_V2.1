// MainLayout - primary layout wrapper (performance-optimized)
import { useRef, lazy, Suspense } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { FocusModeToggle, FocusModeBreakReminder } from "@/components/focus/FocusModeToggle";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Bell } from "lucide-react";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import type { GlobalSearchHandle } from "./GlobalSearch";

// Lazy load non-critical components that aren't needed for initial render
const GlobalSearch = lazy(() => import("./GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const RoleAwareSidebar = lazy(() => import("./RoleAwareSidebar").then(m => ({ default: m.RoleAwareSidebar })));
const LayoutRealtimeEffects = lazy(() => import("./LayoutRealtimeEffects").then(m => ({ default: m.LayoutRealtimeEffects })));
const CelebrationOverlayProvider = lazy(() => import("@/components/gamification/CelebrationOverlayProvider").then(m => ({ default: m.CelebrationOverlayProvider })));
const MobileNavigation = lazy(() => import("@/components/mobile/MobileNavigation").then(m => ({ default: m.MobileNavigation })));
const AICopilotFab = lazy(() => import("@/components/copilot/AICopilotFab").then(m => ({ default: m.AICopilotFab })));
const InstallPrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const UpdatePrompt = lazy(() => import("@/components/pwa/UpdatePrompt").then(m => ({ default: m.UpdatePrompt })));
const OfflineIndicator = lazy(() => import("@/components/pwa/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const searchRef = useRef<GlobalSearchHandle>(null);
  const { currentPageInfo } = useMobileNavigation();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const sidebarFallback = (
    <nav id="main-navigation" className="hidden md:block" aria-label="Navegação principal">
      <div className="w-72 min-h-screen border-r border-border bg-sidebar px-4 pt-6">
        <div className="space-y-3 pt-14">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-10 rounded-xl bg-muted/70 animate-pulse" />
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <SidebarProvider>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <LayoutRealtimeEffects />
        </Suspense>
      </ErrorBoundary>

      {/* Offline indicator at top */}
      <Suspense fallback={null}>
        <OfflineIndicator />
      </Suspense>
      
      {/* Skip Links for Accessibility */}
      <SkipLinks />
      <div className="min-h-screen flex w-full bg-background">
        {/* Hide sidebar on mobile */}
        <ErrorBoundary fallback={sidebarFallback}>
          <Suspense fallback={sidebarFallback}>
            <nav id="main-navigation" className="hidden md:block" aria-label="Navegação principal">
              <RoleAwareSidebar />
            </nav>
          </Suspense>
        </ErrorBoundary>
        
        <main 
          id="main-content" 
          className={cn(
            "flex-1 relative flex flex-col bg-background",
            isMobile && "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
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
          
          {/* Desktop Top Bar - Sticky Glass */}
          <div className="sticky top-0 z-40 hidden md:flex items-center justify-between h-14 px-4 lg:px-6 backdrop-blur-xl bg-background/70 border-b border-border/50 transition-all duration-200">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-colors" />
            </div>
            <div className="flex items-center gap-1.5">
              <FocusModeToggle />
              <Link to="/notificacoes" className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors">
                <Bell className={cn("h-4 w-4 transition-colors", unreadCount > 5 ? "text-destructive" : unreadCount > 0 ? "text-warning" : "text-muted-foreground")} />
                <NotificationBadge 
                  count={unreadCount} 
                  size="sm" 
                  pulse={unreadCount > 5}
                  variant={unreadCount > 5 ? "destructive" : unreadCount > 0 ? "warning" : "default"}
                  className="absolute -top-1 -right-1" 
                />
              </Link>
              <SearchTrigger onClick={() => searchRef.current?.open()} />
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <GlobalSearch ref={searchRef} />
            </Suspense>
          </ErrorBoundary>
          
          {/* Breadcrumbs */}
          <div className="px-4 lg:px-6 pt-3">
            <Breadcrumbs />
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation - lazy */}
        <Suspense fallback={null}>
          <MobileNavigation />
        </Suspense>
        
        {/* Global celebration overlays - lazy */}
        <Suspense fallback={null}>
          <CelebrationOverlayProvider />
        </Suspense>
        
        {/* Focus mode break reminder */}
        <FocusModeBreakReminder />
        
        {/* PWA prompts - lazy */}
        <Suspense fallback={null}>
          <InstallPrompt variant="card" />
          <UpdatePrompt />
        </Suspense>
        
        {/* AI Copilot FAB - lazy */}
        <Suspense fallback={null}>
          <AICopilotFab />
        </Suspense>
        
        {/* Scroll to top */}
        <ScrollToTop />
      </div>
    </SidebarProvider>
  );
}
