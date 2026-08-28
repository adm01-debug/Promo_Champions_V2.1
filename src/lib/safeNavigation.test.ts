import { describe, expect, it } from 'vitest';
import {
  isSafeExternalHttpUrl,
  isSafeInternalPath,
  safeNavigationHref,
} from './safeNavigation';

describe('isSafeInternalPath', () => {
  it('aceita rota interna com query e hash', () => {
    expect(isSafeInternalPath('/vendas?status=won#detalhes')).toBe(true);
  });

  it.each([
    '//externo.example',
    '/\\externo.example',
    '/%5cexterno.example',
    'https://externo.example',
    'javascript:alert(1)',
    ' /vendas',
    '/vendas ',
  ])('rejeita destino não interno seguro: %s', value => {
    expect(isSafeInternalPath(value)).toBe(false);
  });
});

describe('safeNavigationHref', () => {
  it('preserva somente HTTP(S), hash e rotas internas seguras', () => {
    expect(isSafeExternalHttpUrl('https://docs.example.com')).toBe(true);
    expect(isSafeExternalHttpUrl('javascript:alert(1)')).toBe(false);
    expect(safeNavigationHref('https://docs.example.com')).toBe(
      'https://docs.example.com'
    );
    expect(safeNavigationHref('/clientes')).toBe('/clientes');
    expect(safeNavigationHref('#detalhes')).toBe('#detalhes');
  });

  it('neutraliza href inválido', () => {
    expect(safeNavigationHref('//externo.example')).toBe('#');
  });
});
