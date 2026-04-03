/**
 * MainLayout Structure Tests
 * Verifies: tooltips on top bar, breadcrumbs, skip links, focus mode, notifications
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const layoutSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/MainLayout.tsx'),
  'utf-8'
);

describe('MainLayout Structure', () => {
  it('has SkipLinks for accessibility', () => {
    expect(layoutSource).toContain('SkipLinks');
  });

  it('has main landmark with role="main"', () => {
    expect(layoutSource).toContain('role="main"');
  });

  it('has aria-label on main content', () => {
    expect(layoutSource).toContain('aria-label="Conteúdo principal"');
  });

  it('includes Breadcrumbs', () => {
    expect(layoutSource).toContain('Breadcrumbs');
  });

  it('includes TooltipProvider for top bar icons', () => {
    expect(layoutSource).toContain('TooltipProvider');
  });

  it('has tooltip for sidebar trigger', () => {
    expect(layoutSource).toContain('Alternar menu lateral');
  });

  it('has tooltip for search', () => {
    expect(layoutSource).toContain('Buscar (⌘K)');
  });

  it('has tooltip for theme toggle', () => {
    expect(layoutSource).toContain('Alternar tema');
  });

  it('has tooltip for focus mode', () => {
    expect(layoutSource).toContain('Modo foco');
  });

  it('has tooltip for language toggle', () => {
    expect(layoutSource).toContain('Idioma');
  });

  it('has tooltip for notifications', () => {
    expect(layoutSource).toContain('Notificações');
  });

  it('includes ScrollToTop component', () => {
    expect(layoutSource).toContain('ScrollToTop');
  });

  it('includes FocusModeToggle', () => {
    expect(layoutSource).toContain('FocusModeToggle');
  });

  it('includes FocusModeBreakReminder', () => {
    expect(layoutSource).toContain('FocusModeBreakReminder');
  });

  it('includes OfflineIndicator for PWA', () => {
    expect(layoutSource).toContain('OfflineIndicator');
  });

  it('includes InstallPrompt for PWA', () => {
    expect(layoutSource).toContain('InstallPrompt');
  });

  it('includes UpdatePrompt for PWA', () => {
    expect(layoutSource).toContain('UpdatePrompt');
  });

  it('includes AICopilotFab', () => {
    expect(layoutSource).toContain('AICopilotFab');
  });

  it('uses lazy loading for non-critical components', () => {
    expect(layoutSource).toContain('lazy(');
    expect(layoutSource).toContain('Suspense');
  });

  it('has ErrorBoundary wrappers', () => {
    expect(layoutSource).toContain('ErrorBoundary');
  });

  it('has NotificationBadge with pulse for high counts', () => {
    expect(layoutSource).toContain('NotificationBadge');
    expect(layoutSource).toContain('pulse');
  });

  it('sidebar is hidden on mobile', () => {
    expect(layoutSource).toContain('hidden md:block');
  });

  it('has mobile bottom navigation', () => {
    expect(layoutSource).toContain('MobileNavigation');
  });

  it('has MobilePageHeader', () => {
    expect(layoutSource).toContain('MobilePageHeader');
  });

  it('has sticky top bar with backdrop blur', () => {
    expect(layoutSource).toContain('sticky top-0');
    expect(layoutSource).toContain('backdrop-blur');
  });

  it('has CelebrationOverlayProvider for gamification', () => {
    expect(layoutSource).toContain('CelebrationOverlayProvider');
  });

  it('has nav landmark with aria-label', () => {
    expect(layoutSource).toContain('aria-label="Navegação principal"');
  });
});
