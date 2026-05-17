// MainLayout - primary layout wrapper (performance-optimized)
import { useRef, lazy, Suspense, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchTrigger } from "@/components/atoms/SearchTrigger";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { FocusModeBreakReminder } from "@/components/focus/FocusModeToggle";
import { DesktopTopBar } from "@/components/organisms/DesktopTopBar";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { cn } from "@/lib/utils";
import type { GlobalSearchHandle } from "@/components/molecules/GlobalSearch";
import { useLocation } from "react-router-dom";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { CyberArenaBackground } from "@/components/effects/CyberArenaBackground";

// Lazy load non-critical components
const GlobalSearch = lazy(() => import("@/components/molecules/GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const RoleAwareSidebar = lazy(() => import("@/components/organisms/RoleAwareSidebar").then(m => ({ default: m.RoleAwareSidebar })));
const LayoutRealtimeEffects = lazy(() => import("@/components/organisms/LayoutRealtimeEffects").then(m => ({ default: m.LayoutRealtimeEffects })));
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
    window.scrollTo({ top: 0, behavior: 'instant' });
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
      <CyberArenaBackground />
      <div className="min-h-screen flex w-full bg-background/50">
        <ErrorBoundary fallback={sidebarFallback}>
          <Suspense fallback={sidebarFallback}>
            <motion.nav 
              id="main-navigation" 
              className="hidden md:block" 
              aria-label="Navegação principal"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <RoleAwareSidebar />
            </motion.nav>
          </Suspense>
        </ErrorBoundary>
        
        <motion.main 
          id="main-content" 
          className={cn(
            "flex-1 relative flex flex-col bg-background/40 backdrop-blur-[2px]",
            isMobile && "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
          )}
          role="main"
          aria-label="Conteúdo principal"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile Header */}
          <MobilePageHeader 
            title={currentPageInfo.title}
            subtitle={currentPageInfo.subtitle}
            rightAction={
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("semantic-search:open"))}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 active:scale-90 transition-all touch-none"
                  aria-label="Busca IA"
                >
                  <Sparkles className="h-5 w-5" />
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
        </motion.main>
        
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
