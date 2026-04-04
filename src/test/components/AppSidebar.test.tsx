/**
 * AppSidebar Component Tests
 * Verifies: grouped submenus, menu items exist, collapsible groups
 * Tests check both AppSidebar.tsx and sidebarMenuData.ts (extracted module)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const sidebarSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/AppSidebar.tsx'),
  'utf-8'
);

const menuDataSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/sidebar/sidebarMenuData.ts'),
  'utf-8'
);

const combined = sidebarSource + '\n' + menuDataSource;

describe('AppSidebar Structure', () => {
  it('uses Collapsible component for grouped menus', () => {
    expect(sidebarSource).toContain('Collapsible');
    expect(sidebarSource).toContain('CollapsibleTrigger');
    expect(sidebarSource).toContain('CollapsibleContent');
  });

  it('defines MenuGroup interface with label and items', () => {
    expect(menuDataSource).toContain('interface MenuGroup');
    expect(menuDataSource).toContain('label: string');
    expect(menuDataSource).toContain('items: MenuItem[]');
  });

  it('has CRM group', () => {
    expect(menuDataSource).toContain('CRM');
  });

  it('has Pipeline menu item', () => {
    expect(menuDataSource).toContain('Pipeline');
  });

  it('has Vendas menu item', () => {
    expect(menuDataSource).toContain('Vendas');
  });

  it('has Clientes menu item', () => {
    expect(menuDataSource).toContain('Clientes');
  });

  it('has Dashboard as a top-level item', () => {
    expect(menuDataSource).toContain('Dashboard');
  });

  it('has view mode support (SDR/Closer/Gestão)', () => {
    expect(combined).toContain('sdr');
    expect(combined).toContain('closer');
    expect(combined).toContain('gestao');
  });

  it('uses ScrollArea for long menu lists', () => {
    expect(sidebarSource).toContain('ScrollArea');
  });

  it('has ChevronRight icon for collapsible groups', () => {
    expect(sidebarSource).toContain('ChevronRight');
  });

  it('imports NavLink component', () => {
    expect(sidebarSource).toContain("from \"@/components/navigation/NavLink\"");
  });

  it('has Análises group or analytics items', () => {
    expect(menuDataSource).toMatch(/Anális|analytics|Relatórios/i);
  });

  it('has Settings/Configurações item', () => {
    expect(menuDataSource).toContain('Settings');
  });

  it('has UserRoleBadge in sidebar', () => {
    expect(sidebarSource).toContain('UserRoleBadge');
  });
});
