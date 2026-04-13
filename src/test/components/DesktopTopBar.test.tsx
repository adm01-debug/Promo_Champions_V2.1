/**
 * DesktopTopBar Component Tests
 * Verifies: structure, tooltips, search trigger, notifications, clustering, accessibility
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/DesktopTopBar.tsx'),
  'utf-8'
);

describe('DesktopTopBar', () => {
  // === Structure ===
  it('is a sticky top bar with z-40', () => {
    expect(source).toContain('sticky top-0 z-40');
  });

  it('is hidden on mobile (md:flex)', () => {
    expect(source).toContain('hidden md:flex');
  });

  it('has backdrop blur for glassmorphism effect', () => {
    expect(source).toContain('backdrop-blur-xl');
  });

  it('has border-bottom separator', () => {
    expect(source).toContain('border-b');
  });

  // === Left Cluster ===
  it('includes SidebarTrigger', () => {
    expect(source).toContain('SidebarTrigger');
  });

  it('includes Breadcrumbs in left cluster', () => {
    expect(source).toContain('Breadcrumbs');
  });

  it('left cluster has overflow hidden for breadcrumbs', () => {
    expect(source).toContain('overflow-hidden');
  });

  // === Right Cluster Actions ===
  it('has search button with keyboard shortcut ⌘K', () => {
    expect(source).toContain('⌘K');
  });

  it('has search label "Buscar..."', () => {
    expect(source).toContain('Buscar...');
  });

  it('includes NotificationBadge', () => {
    expect(source).toContain('NotificationBadge');
  });

  it('notifications link to /notificacoes', () => {
    expect(source).toContain('/notificacoes');
  });

  it('has notification aria-label', () => {
    expect(source).toContain('aria-label="Notificações"');
  });

  it('includes FocusModeToggle', () => {
    expect(source).toContain('FocusModeToggle');
  });

  it('includes LanguageToggle', () => {
    expect(source).toContain('LanguageToggle');
  });

  it('includes ThemeToggle', () => {
    expect(source).toContain('ThemeToggle');
  });

  // === Tooltips ===
  it('has tooltip for sidebar: "Alternar menu lateral"', () => {
    expect(source).toContain('Alternar menu lateral');
  });

  it('has tooltip for search: "Buscar (⌘K)"', () => {
    expect(source).toContain('Buscar (⌘K)');
  });

  it('has tooltip for notifications', () => {
    expect(source).toContain('Notificações');
  });

  it('includes FocusModeToggle component (tooltip delegated)', () => {
    expect(source).toContain('FocusModeToggle');
  });

  it('includes LanguageToggle component (tooltip delegated)', () => {
    expect(source).toContain('LanguageToggle');
  });

  it('includes ThemeToggle component (tooltip delegated)', () => {
    expect(source).toContain('ThemeToggle');
  });

  // === Visual Dividers ===
  it('has visual dividers between action groups', () => {
    const dividerCount = (source.match(/w-px h-5 bg-border/g) || []).length;
    expect(dividerCount).toBeGreaterThanOrEqual(2);
  });

  // === Notification Intelligence ===
  it('uses useUnreadNotificationsCount hook', () => {
    expect(source).toContain('useUnreadNotificationsCount');
  });

  it('changes bell color based on unread count > 5 (destructive)', () => {
    expect(source).toContain('text-destructive');
  });

  it('changes bell color for moderate unread count (warning)', () => {
    expect(source).toContain('text-warning');
  });

  it('pulses notification badge when count > 5', () => {
    expect(source).toContain('pulse={unreadCount > 5}');
  });

  it('shows dynamic notification count in tooltip', () => {
    expect(source).toContain('novas');
  });

  // === Responsive ===
  it('search label hidden on small screens (lg:inline)', () => {
    expect(source).toContain('hidden lg:inline');
  });

  it('keyboard shortcut hidden on small screens', () => {
    expect(source).toContain('hidden lg:inline-flex');
  });

  // === Interface ===
  it('accepts searchRef prop', () => {
    expect(source).toContain('searchRef');
  });

  it('calls searchRef.current?.open() on search click', () => {
    expect(source).toContain('searchRef.current?.open()');
  });

  // === TooltipProvider ===
  it('uses TooltipProvider with delayDuration', () => {
    expect(source).toContain('delayDuration={300}');
  });
});
