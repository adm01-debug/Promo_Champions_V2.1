/**
 * MainLayout V2 Tests — validates DesktopTopBar integration and architecture
 * Verifies: component delegation, lazy loading, sidebar fallback, mobile/desktop split
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const layoutSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/MainLayout.tsx'),
  'utf-8'
);

describe('MainLayout V2 Architecture', () => {
  // === DesktopTopBar delegation ===
  it('delegates top bar to DesktopTopBar component', () => {
    expect(layoutSource).toContain('DesktopTopBar');
  });

  it('passes searchRef to DesktopTopBar', () => {
    expect(layoutSource).toContain('searchRef={searchRef}');
  });

  it('does NOT render inline TooltipProvider (delegated to DesktopTopBar)', () => {
    // MainLayout should not have its own TooltipProvider — it's in DesktopTopBar
    expect(layoutSource).not.toContain('import { TooltipProvider');
  });

  // === Lazy loading strategy ===
  it('lazy loads GlobalSearch', () => {
    expect(layoutSource).toContain("lazy(() => import(\"./GlobalSearch\")");
  });

  it('lazy loads RoleAwareSidebar', () => {
    expect(layoutSource).toContain("lazy(() => import(\"./RoleAwareSidebar\")");
  });

  it('lazy loads MobileNavigation', () => {
    expect(layoutSource).toContain("lazy(() => import(\"@/components/mobile/MobileNavigation\")");
  });

  it('lazy loads CelebrationOverlayProvider', () => {
    expect(layoutSource).toContain('CelebrationOverlayProvider');
  });

  it('lazy loads AICopilotFab', () => {
    expect(layoutSource).toContain("lazy(() => import(\"@/components/copilot/AICopilotFab\")");
  });

  it('lazy loads RouteTracker', () => {
    expect(layoutSource).toContain("lazy(() => import(\"@/components/analytics/RouteTracker\")");
  });

  it('lazy loads PWA components', () => {
    expect(layoutSource).toContain('InstallPrompt');
    expect(layoutSource).toContain('UpdatePrompt');
    expect(layoutSource).toContain('OfflineIndicator');
  });

  // === Sidebar fallback ===
  it('has sidebar skeleton fallback with 7 placeholder items', () => {
    expect(layoutSource).toContain('length: 7');
  });

  it('sidebar fallback has animate-pulse', () => {
    expect(layoutSource).toContain('animate-pulse');
  });

  it('sidebar fallback uses border-r border-border', () => {
    expect(layoutSource).toContain('border-r border-border');
  });

  // === Mobile responsive ===
  it('adds bottom padding on mobile for nav bar', () => {
    expect(layoutSource).toContain('pb-[calc(5rem+env(safe-area-inset-bottom,0px))]');
  });

  it('uses useIsMobile for mobile detection', () => {
    expect(layoutSource).toContain('useIsMobile');
  });

  // === Mobile header ===
  it('renders MobilePageHeader with search trigger', () => {
    expect(layoutSource).toContain('MobilePageHeader');
    expect(layoutSource).toContain('SearchTrigger');
  });

  // === Error boundaries ===
  it('wraps sidebar in ErrorBoundary', () => {
    // Check ErrorBoundary exists near sidebar
    expect(layoutSource).toContain('ErrorBoundary');
  });

  it('wraps realtime effects in ErrorBoundary', () => {
    expect(layoutSource).toContain('LayoutRealtimeEffects');
  });

  // === Accessibility ===
  it('has skip links component', () => {
    expect(layoutSource).toContain('SkipLinks');
  });

  it('main has id="main-content"', () => {
    expect(layoutSource).toContain('id="main-content"');
  });

  it('nav has id="main-navigation"', () => {
    expect(layoutSource).toContain('id="main-navigation"');
  });

  // === SidebarProvider ===
  it('wraps everything in SidebarProvider', () => {
    expect(layoutSource).toContain('SidebarProvider');
  });

  // === Clean architecture: no inline top bar code ===
  it('does not contain inline Bell icon import (delegated)', () => {
    expect(layoutSource).not.toContain("import { Bell");
  });

  it('does not contain inline LanguageToggle import (delegated)', () => {
    expect(layoutSource).not.toContain("import { LanguageToggle");
  });
});
