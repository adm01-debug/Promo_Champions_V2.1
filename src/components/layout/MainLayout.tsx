// MainLayout - primary layout wrapper (performance-optimized)
import { useRef, lazy, Suspense, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchTrigger } from "./SearchTrigger";
import { ThemeToggle } from "./ThemeToggle";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { FocusModeBreakReminder } from "@/components/focus/FocusModeToggle";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { cn } from "@/lib/utils";
import type { GlobalSearchHandle } from "./GlobalSearch";
import { useLocation } from "react-router-dom";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";

// Lazy load non-critical components
const GlobalSearch = lazy(() => import("./GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const RoleAwareSidebar = lazy(() => import("./RoleAwareSidebar").then(m => ({ default: m.RoleAwareSidebar })));
const LayoutRealtimeEffects = lazy(() => import("./LayoutRealtimeEffects").then(m => ({ default: m.LayoutRealtimeEffects })));
const CelebrationOverlayProvider = lazy(() => import("@/components/gamification/CelebrationOverlayProvider").then(m => ({ default: m.CelebrationOverlayProvider })));
const MobileNavigation = lazy(() => import("@/components/mobile/MobileNavigation").then(m => ({ default: m.MobileNavigation })));
const AICopilotFab = lazy(() => import("@/components/copilot/AICopilotFab").then(m => ({ default: m.AICopilotFab })));
const InstallPrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const UpdatePrompt = lazy(() => import("@/components/pwa/UpdatePrompt").then(m => ({ default: m.UpdatePrompt })));
const OfflineIndicator = lazy(() => import("@/components/pwa/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const RouteTracker = lazy(() => import("@/components/analytics/RouteTracker").then(m => ({ default: m.RouteTracker })));
const ConsentBanner = lazy(() => import("@/components/lgpd/ConsentBanner").then(m => ({ default: m.ConsentBanner })));
const PerformanceMonitor = lazy(() => import("@/components/admin/PerformanceMonitor").then(m => ({ default: m.PerformanceMonitor })));
const SemanticSearchMount = lazy(() => import("@/components/semantic/SemanticSearchMount").then(m => ({ default: m.SemanticSearchMount })));

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useVoiceNavigation(); // Enable futuristic voice control
  const isMobile = useIsMobile();
  const searchRef = useRef<GlobalSearchHandle>(null);
  const { currentPageInfo } = useMobileNavigation();
  const location = useLocation();

  // Unified Scroll to Top logic with premium feel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Dynamic Title Sync for excellence
  useEffect(() => {
    const baseTitle = "Promo Champions";
    const pageTitle = currentPageInfo.title;
    const pageSubtitle = currentPageInfo.subtitle;
    
    if (pageTitle && pageTitle !== baseTitle) {
      document.title = `${pageTitle}${pageSubtitle ? ` | ${pageSubtitle}` : ''} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [currentPageInfo]);

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

      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>

      <Suspense fallback={null}>
        <OfflineIndicator />
      </Suspense>
      
      <SkipLinks />
      <div className="min-h-screen flex w-full bg-background">
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
          {/* Mobile Header */}
          <MobilePageHeader 
            title={currentPageInfo.title}
            subtitle={currentPageInfo.subtitle}
            rightAction={
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("semantic-search:open"))}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 active:scale-90 transition-all"
                  aria-label="Busca IA"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <SearchTrigger onClick={() => searchRef.current?.open()} />
                <ThemeToggle />
              </div>
            }
          />
          
          {/* Desktop Top Bar — clean, grouped */}
          <DesktopTopBar searchRef={searchRef} />
          
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <GlobalSearch ref={searchRef} />
            </Suspense>
          </ErrorBoundary>
          
          {/* Main content area */}
          <div className="flex-1">
            {children}
          </div>
        </main>
        
        <Suspense fallback={null}>
          <MobileNavigation />
        </Suspense>
        
        <Suspense fallback={null}>
          <CelebrationOverlayProvider />
        </Suspense>
        
        <FocusModeBreakReminder />
        
        <Suspense fallback={null}>
          <InstallPrompt variant="card" />
          <UpdatePrompt />
        </Suspense>
        
        <Suspense fallback={null}>
          <AICopilotFab />
        </Suspense>
        
        <ScrollToTop />
        
        <Suspense fallback={null}>
          <ConsentBanner />
        </Suspense>
        
        <Suspense fallback={null}>
          <PerformanceMonitor />
        </Suspense>

        <Suspense fallback={null}>
          <SemanticSearchMount />
        </Suspense>
      </div>
    </SidebarProvider>
  );
}
