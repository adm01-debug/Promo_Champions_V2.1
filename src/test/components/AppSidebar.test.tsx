/**
 * AppSidebar Component Tests
 * Verifies: grouped submenus, menu items exist, collapsible groups
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const sidebarSource = fs.readFileSync(
  path.resolve(__dirname, '../../components/layout/AppSidebar.tsx'),
  'utf-8'
);

describe('AppSidebar Structure', () => {
  it('uses Collapsible component for grouped menus', () => {
    expect(sidebarSource).toContain('Collapsible');
    expect(sidebarSource).toContain('CollapsibleTrigger');
    expect(sidebarSource).toContain('CollapsibleContent');
  });

  it('defines MenuGroup interface with label and items', () => {
    expect(sidebarSource).toContain('interface MenuGroup');
    expect(sidebarSource).toContain('label: string');
    expect(sidebarSource).toContain('items: MenuItem[]');
  });

  it('has CRM group', () => {
    expect(sidebarSource).toContain('CRM');
  });

  it('has Pipeline menu item', () => {
    expect(sidebarSource).toContain('Pipeline');
  });

  it('has Vendas menu item', () => {
    expect(sidebarSource).toContain('Vendas');
  });

  it('has Clientes menu item', () => {
    expect(sidebarSource).toContain('Clientes');
  });

  it('has Dashboard as a top-level item', () => {
    expect(sidebarSource).toContain('Dashboard');
  });

  it('has view mode support (SDR/Closer/Gestão)', () => {
    expect(sidebarSource).toContain('sdr');
    expect(sidebarSource).toContain('closer');
    expect(sidebarSource).toContain('gestao');
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
    expect(sidebarSource).toMatch(/Anális|analytics|Relatórios/i);
  });

  it('has Settings/Configurações item', () => {
    expect(sidebarSource).toContain('Settings');
  });

  it('has UserRoleBadge in sidebar', () => {
    expect(sidebarSource).toContain('UserRoleBadge');
  });
});
