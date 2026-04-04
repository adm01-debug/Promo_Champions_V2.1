/**
 * MobileNavigation & MobileComponents Tests
 * Verifies: nav items, active states, badges, drawer, accessibility, pill indicator
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const navSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/mobile/MobileNavigation.tsx'),
  'utf-8'
);
const compSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/mobile/MobileComponents.tsx'),
  'utf-8'
);

describe('MobileNavigation', () => {
  // === Nav Items ===
  it('has Home nav item', () => {
    expect(navSource).toContain("label: 'Home'");
  });

  it('has Pipeline nav item', () => {
    expect(navSource).toContain("label: 'Pipeline'");
  });

  it('has Tarefas nav item', () => {
    expect(navSource).toContain("label: 'Tarefas'");
  });

  it('has IA nav item', () => {
    expect(navSource).toContain("label: 'IA'");
  });

  it('has Menu nav item', () => {
    expect(navSource).toContain("label: 'Menu'");
  });

  // === Routes ===
  it('Home links to /', () => {
    expect(navSource).toContain("href: '/'");
  });

  it('Pipeline links to /pipeline', () => {
    expect(navSource).toContain("href: '/pipeline'");
  });

  it('Tarefas links to /tarefas', () => {
    expect(navSource).toContain("href: '/tarefas'");
  });

  it('IA links to /assistente', () => {
    expect(navSource).toContain("href: '/assistente'");
  });

  // === Mobile-only rendering ===
  it('returns null when not mobile', () => {
    expect(navSource).toContain('if (!isMobile) return null');
  });

  it('uses useIsMobile hook', () => {
    expect(navSource).toContain('useIsMobile');
  });

  // === Notification badge ===
  it('uses useUnreadNotificationsCount hook', () => {
    expect(navSource).toContain('useUnreadNotificationsCount');
  });

  it('passes unread count as badge to Home', () => {
    expect(navSource).toContain('badge: unreadCount > 0 ? unreadCount : undefined');
  });

  // === Drawer ===
  it('includes MobileDrawer', () => {
    expect(navSource).toContain('MobileDrawer');
  });

  it('Menu item opens drawer', () => {
    expect(navSource).toContain('setIsDrawerOpen(true)');
  });

  // === Filled/Outlined icons ===
  it('has filledIcon variants for active state', () => {
    expect(navSource).toContain('filledIcon:');
  });

  it('uses fill-current for filled icons', () => {
    expect(navSource).toContain('fill-current');
  });
});

describe('MobileComponents (MobileBottomNav)', () => {
  // === Sliding pill indicator ===
  it('has animated pill indicator with layoutId', () => {
    expect(compSource).toContain('layoutId="mobile-nav-pill"');
  });

  it('pill has spring animation', () => {
    expect(compSource).toContain("type: 'spring'");
  });

  it('pill uses primary/10 background', () => {
    expect(compSource).toContain('bg-primary/10');
  });

  // === Active state animation ===
  it('scales active items up', () => {
    expect(compSource).toContain('scale: 1.1');
  });

  it('lifts active items with y offset', () => {
    expect(compSource).toContain('y: -1');
  });

  // === Notification badge ===
  it('renders badge count', () => {
    expect(compSource).toContain('item.badge');
  });

  it('caps badge at 99+', () => {
    expect(compSource).toContain("'99+'");
  });

  it('badge uses destructive color', () => {
    expect(compSource).toContain('bg-destructive');
  });

  // === Accessibility ===
  it('has aria-label="Navegação principal mobile"', () => {
    expect(compSource).toContain('Navegação principal mobile');
  });

  it('sets aria-current="page" on active items', () => {
    expect(compSource).toContain("aria-current={item.isActive ? 'page' : undefined}");
  });

  it('has aria-label on buttons', () => {
    expect(compSource).toContain('aria-label={item.label}');
  });

  // === Touch optimization ===
  it('has min touch target size (48px)', () => {
    expect(compSource).toContain('min-h-[48px]');
    expect(compSource).toContain('min-w-[48px]');
  });

  it('has touch-manipulation for fast taps', () => {
    expect(compSource).toContain('touch-manipulation');
  });

  it('has active:scale-95 for press feedback', () => {
    expect(compSource).toContain('active:scale-95');
  });

  // === Layout ===
  it('is fixed at bottom', () => {
    expect(compSource).toContain('fixed bottom-0');
  });

  it('has high z-index (z-50)', () => {
    expect(compSource).toContain('z-50');
  });

  it('has backdrop blur', () => {
    expect(compSource).toContain('backdrop-blur-lg');
  });

  it('supports safe-area-inset-bottom', () => {
    expect(compSource).toContain('safe-area-inset-bottom');
  });

  // === Button vs Link rendering ===
  it('renders button for items with onClick', () => {
    expect(compSource).toContain('item.onClick');
    expect(compSource).toContain('<button');
  });

  it('renders Link for items without onClick', () => {
    expect(compSource).toContain('<Link');
  });
});
