import { describe, expect, it } from 'vitest';
import { resolveBackFallback } from './useBackNavigation';

describe('resolveBackFallback', () => {
  it('sobe um nível quando o último segmento é uuid (página de detalhe)', () => {
    expect(
      resolveBackFallback('/pipeline/deals/3f2a1b4c-1111-4222-8333-abcdefabcdef')
    ).toBe('/pipeline/deals');
  });

  it('sobe um nível quando o último segmento é numérico', () => {
    expect(resolveBackFallback('/pedidos/12345')).toBe('/pedidos');
  });

  it('usa o override quando o prefixo não é rota de listagem', () => {
    expect(resolveBackFallback('/vendedor/3f2a1b4c-1111-4222-8333-abcdefabcdef')).toBe(
      '/vendedores'
    );
    expect(resolveBackFallback('/meus-pedidos/42')).toBe('/acompanhamento-pedidos');
    expect(
      resolveBackFallback('/race-arena/spectator/9f2a1b4c-1111-4222-8333-abcdefabcdef')
    ).toBe('/race-arena');
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
