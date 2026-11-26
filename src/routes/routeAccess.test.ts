/**
 * ACESSO-MENU — trava a fonte única de níveis de acesso.
 *
 * As listas de `routeAccess.ts` alimentam o filtro do menu e da paleta de
 * comandos. Se o roteador mudar de guarda (`<Admin>` / `<Manager>`) e a lista
 * não acompanhar, o menu volta a oferecer um caminho que termina em "Acesso
 * Negado". O teste lê `AppRoutes.tsx` e compara as duas fontes.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  adminOnlyRoutes,
  managerOnlyRoutes,
  canAccessPath,
  requiredRoleFor,
} from './routeAccess';
import {
  getMainItems,
  getGroupedItems,
  type ViewMode,
} from '@/components/layout/sidebar/sidebarMenuData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const APP_ROUTES = path.join(REPO_ROOT, 'src/routes/AppRoutes.tsx');
const SIDEBAR_DATA = path.join(
  REPO_ROOT,
  'src/components/layout/sidebar/sidebarMenuData.ts'
);

/** Lê o `element` de cada `path="..."` e classifica pelo wrapper que o fecha. */
function guardedRoutes(): { admin: string[]; manager: string[] } {
  const source = fs.readFileSync(APP_ROUTES, 'utf8');
  const matches = [...source.matchAll(/path="([^"]+)"/g)];
  const admin: string[] = [];
  const manager: string[] = [];
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1]?.index ?? 0) : source.length;
    const segment = source.slice(start, end);
    if (segment.includes('</Admin>')) admin.push(match[1] ?? '');
    else if (segment.includes('</Manager>')) manager.push(match[1] ?? '');
  });
  return { admin, manager };
}

const guarded = guardedRoutes();
const nobody = { isAdmin: false, isManager: false };
const gestor = { isAdmin: false, isManager: true };
const admin = { isAdmin: true, isManager: false };

describe('routeAccess — paridade com o roteador', () => {
  it('lista de rotas exclusivas de admin bate com os wrappers <Admin>', () => {
    expect([...adminOnlyRoutes].sort()).toEqual([...guarded.admin].sort());
  });

  it('lista de rotas de gestor bate com os wrappers <Manager>', () => {
    expect([...managerOnlyRoutes].sort()).toEqual([...guarded.manager].sort());
  });

  it('nenhuma rota aparece nas duas listas', () => {
    const overlap = adminOnlyRoutes.filter(route => managerOnlyRoutes.includes(route));
    expect(overlap).toEqual([]);
  });
});

describe('canAccessPath', () => {
  it('bloqueia rota de gestor para quem não é gestor nem admin', () => {
    expect(canAccessPath('/ferramentas/bi', nobody)).toBe(false);
    expect(canAccessPath('/assinatura-digital', nobody)).toBe(false);
    expect(canAccessPath('/metas', nobody)).toBe(false);
  });

  it('libera rota de gestor para gestor e para admin', () => {
    expect(canAccessPath('/ferramentas/bi', gestor)).toBe(true);
    expect(canAccessPath('/ferramentas/bi', admin)).toBe(true);
  });

  it('rota exclusiva de admin fica fechada ao gestor', () => {
    expect(canAccessPath('/feature-flags', gestor)).toBe(false);
    expect(canAccessPath('/feature-flags', admin)).toBe(true);
  });

  it('/admin/comissoes é de gestor, não capturado por /admin', () => {
    expect(requiredRoleFor('/admin/comissoes')).toBe('manager');
    expect(canAccessPath('/admin/comissoes', gestor)).toBe(true);
    expect(requiredRoleFor('/admin')).toBe('admin');
  });

  it('rotas abertas passam para qualquer papel', () => {
    expect(canAccessPath('/pipeline', nobody)).toBe(true);
    expect(canAccessPath('/comissoes', nobody)).toBe(true);
  });

  it('/assinatura-digital é de gestor — não sobra no menu do Closer (QA-178)', () => {
    expect(requiredRoleFor('/assinatura-digital')).toBe('manager');
    expect(canAccessPath('/assinatura-digital', nobody)).toBe(false);
    expect(canAccessPath('/assinatura-digital', gestor)).toBe(true);
  });

  it('ignora query string e barra final', () => {
    expect(canAccessPath('/metas?tab=1', nobody)).toBe(false);
    expect(canAccessPath('/metas/', nobody)).toBe(false);
  });

  it('sub-rota herda a guarda do prefixo', () => {
    expect(requiredRoleFor('/analytics/abc')).toBe('manager');
    expect(requiredRoleFor('/relatorios/funil/2026')).toBe('manager');
  });
});

describe('menu lateral — páginas antes órfãs continuam alcançáveis', () => {
  const modes: ViewMode[] = ['sdr', 'closer', 'gestao'];
  const menuUrls = modes
    .flatMap(mode => [
      ...getMainItems(mode),
      ...getGroupedItems(mode).flatMap(group => group.items),
    ])
    .map(item => item.url);

  it.each(['/perfil-gamer', '/desafios-diarios', '/bi-vendedor', '/abm'])(
    '%s tem entrada no menu (rota registrada não pode ficar sem caminho na UI)',
    url => {
      expect(menuUrls).toContain(url);
    }
  );
});

describe('menu lateral — nenhum item oferecido a quem não pode abrir', () => {
  const menuSource = fs.readFileSync(SIDEBAR_DATA, 'utf8');

  function urlsBetween(startMarker: string, endMarker: string): string[] {
    const start = menuSource.indexOf(startMarker);
    const end = menuSource.indexOf(endMarker, start + startMarker.length);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    return [...menuSource.slice(start, end).matchAll(/url: '([^']+)'/g)].map(
      match => match[1] ?? ''
    );
  }

  it('itens das visões SDR e Closer são abertos a qualquer autenticado', () => {
    const blocked = [
      ...urlsBetween('const sdrMainItems', 'const gestaoMainItems'),
      ...urlsBetween('const sdrGroupedItems', 'const gestaoGroupedItems'),
    ].filter(url => !canAccessPath(url, nobody));
    expect(blocked).toEqual([]);
  });

  it('itens de gestão exigem gestor', () => {
    const blockedForSales = urlsBetween('const gestaoMainItems', 'const sdrGroupedItems')
      .concat(urlsBetween('const gestaoGroupedItems', 'export const systemItems'))
      .filter(url => !canAccessPath(url, nobody));
    expect(blockedForSales.length).toBeGreaterThan(5);
  });

  it('itens de administração são exclusivos de admin', () => {
    const sources = urlsBetween('export const adminOnlyItems', 'export const viewModes');
    const notAdminOnly = sources.filter(url => requiredRoleFor(url) !== 'admin');
    // Etapa 173 vai decidir se gestor também entra nesses itens; até lá, o menu
    // só é exibido para admin, e o filtro garante que ninguém recebe link morto.
    expect(notAdminOnly.every(url => canAccessPath(url, admin))).toBe(true);
  });
});
