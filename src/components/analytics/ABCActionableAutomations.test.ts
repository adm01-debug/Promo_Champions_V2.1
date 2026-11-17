import { describe, expect, it } from 'vitest';
import {
  buildAbcAutomations,
  CONCENTRATION_RISK_PCT,
  LONG_TAIL_MAX_PCT,
} from './ABCActionableAutomations';

type Cls = 'A' | 'B' | 'C';
const item = (name: string, revenue: number, classification: Cls) => ({
  name,
  revenue,
  percentage: 0,
  cumulativePercentage: 0,
  classification,
});

describe('buildAbcAutomations', () => {
  it('não gera nada sem clientes', () => {
    expect(buildAbcAutomations([], [], 0)).toEqual([]);
    expect(buildAbcAutomations([], [item('P', 10, 'A')], 10)).toEqual([]);
  });

  it('não gera nada com receita zero, mesmo havendo clientes', () => {
    expect(buildAbcAutomations([item('C1', 0, 'A')], [], 0)).toEqual([]);
  });

  it('classe A acima do limiar de concentração vira risco', () => {
    const clients = [item('C1', 600, 'A'), item('C2', 400, 'B')];
    const [a] = buildAbcAutomations(clients, [], 1000);
    expect(a?.id).toBe('carteira-classe-a');
    expect(a?.severity).toBe('risk');
    expect(a?.finding).toContain('60.0%');
    expect(CONCENTRATION_RISK_PCT).toBe(50);
  });

  it('classe A dentro do limiar é oportunidade, não risco', () => {
    const clients = [item('C1', 300, 'A'), item('C2', 700, 'B')];
    const a = buildAbcAutomations(clients, [], 1000).find(
      x => x.id === 'carteira-classe-a'
    );
    expect(a?.severity).toBe('opportunity');
    expect(a?.finding).toContain('30.0%');
  });

  it('cauda classe C só aparece quando é fatia pequena', () => {
    const magra = [item('A1', 950, 'A'), item('C1', 25, 'C'), item('C2', 25, 'C')];
    expect(
      buildAbcAutomations(magra, [], 1000).some(x => x.id === 'cauda-classe-c')
    ).toBe(true);
    const gorda = [item('A1', 500, 'A'), item('C1', 500, 'C')];
    expect(
      buildAbcAutomations(gorda, [], 1000).some(x => x.id === 'cauda-classe-c')
    ).toBe(false);
    expect(LONG_TAIL_MAX_PCT).toBe(10);
  });

  it('dependência de produto só com mais de um produto e acima do limiar', () => {
    const clients = [item('C1', 1000, 'A')];
    const umSo = buildAbcAutomations(clients, [item('P1', 1000, 'A')], 1000);
    expect(umSo.some(x => x.id === 'dependencia-produto')).toBe(false);

    const concentrado = buildAbcAutomations(
      clients,
      [item('P1', 800, 'A'), item('P2', 200, 'B')],
      1000
    );
    const dep = concentrado.find(x => x.id === 'dependencia-produto');
    expect(dep?.finding).toContain('P1');
    expect(dep?.finding).toContain('80.0%');

    const distribuido = buildAbcAutomations(
      clients,
      [item('P1', 400, 'A'), item('P2', 350, 'B'), item('P3', 250, 'C')],
      1000
    );
    expect(distribuido.some(x => x.id === 'dependencia-produto')).toBe(false);
  });

  it('cada item traz achado e ação, e nenhum texto fica vazio', () => {
    const clients = [item('C1', 600, 'A'), item('C2', 350, 'B'), item('C3', 50, 'C')];
    const all = buildAbcAutomations(
      clients,
      [item('P1', 900, 'A'), item('P2', 100, 'C')],
      1000
    );
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (const a of all) {
      expect(a.finding.trim().length).toBeGreaterThan(0);
      expect(a.action.trim().length).toBeGreaterThan(0);
      expect(a.title.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(all.map(a => a.id)).size).toBe(all.length);
  });
});
