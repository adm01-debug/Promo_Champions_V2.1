import { beforeEach, describe, expect, it } from 'vitest';
import { recordNavTrail, resolveBackFallback } from './useBackNavigation';

describe('resolveBackFallback', () => {
  it('sobe um nível quando o último segmento é uuid (página de detalhe)', () => {
    expect(
      resolveBackFallback('/pipeline/deals/3f2a1b4c-1111-4222-8333-abcdefabcdef')
    ).toBe('/pipeline/deals');
  });

  it('sobe um nível quando o último segmento é numérico', () => {
    expect(resolveBackFallback('/pedidos/12345')).toBe('/pedidos');
  });

  it('sobe para a raiz da seção admin em subpágina sem id', () => {
    expect(resolveBackFallback('/admin/comissoes')).toBe('/admin');
    expect(resolveBackFallback('/settings/perfil')).toBe('/settings');
  });

  it('cai no dashboard em rota de primeiro nível sem padrão conhecido', () => {
    expect(resolveBackFallback('/ranking')).toBe('/dashboard');
    expect(resolveBackFallback('/')).toBe('/dashboard');
  });
});

describe('recordNavTrail', () => {
  beforeEach(() => sessionStorage.clear());

  it('registra paths em ordem sem duplicar consecutivos', () => {
    recordNavTrail('/a');
    recordNavTrail('/a');
    recordNavTrail('/b');
    expect(JSON.parse(sessionStorage.getItem('app_nav_trail')!)).toEqual(['/a', '/b']);
  });

  it('limita o trail a 8 entradas', () => {
    for (let i = 0; i < 12; i++) recordNavTrail(`/p${i}`);
    const trail = JSON.parse(sessionStorage.getItem('app_nav_trail')!) as string[];
    expect(trail).toHaveLength(8);
    expect(trail[trail.length - 1]).toBe('/p11');
  });
});
