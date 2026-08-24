import { describe, it, expect } from 'vitest';
import {
  aggregateMarkupOverview,
  buildMarkupSellersCsv,
  CRITICAL_MARKUP_THRESHOLD,
} from './markupOverviewHelpers';

const names = new Map([
  ['v1', 'Ana'],
  ['v2', 'Bruno'],
]);

describe('aggregateMarkupOverview', () => {
  it('lista vazia → resumo zerado e sem vendedores', () => {
    const r = aggregateMarkupOverview([], names);
    expect(r.summary.total).toBe(0);
    expect(r.sellers).toEqual([]);
  });

  it('agrupa média por vendedor e ordena desc', () => {
    const r = aggregateMarkupOverview(
      [
        { salesperson_id: 'v1', markup_pct: 50 },
        { salesperson_id: 'v1', markup_pct: 30 },
        { salesperson_id: 'v2', markup_pct: 60 },
      ],
      names,
    );
    expect(r.sellers.map((s) => s.name)).toEqual(['Bruno', 'Ana']);
    expect(r.sellers[0]?.average).toBe(60);
    expect(r.sellers[1]?.average).toBe(40);
  });

  it('conta vendas críticas abaixo do limiar', () => {
    const r = aggregateMarkupOverview(
      [
        { salesperson_id: 'v1', markup_pct: CRITICAL_MARKUP_THRESHOLD - 0.01 },
        { salesperson_id: 'v1', markup_pct: CRITICAL_MARKUP_THRESHOLD },
        { salesperson_id: 'v1', markup_pct: -5 },
      ],
      names,
    );
    expect(r.sellers[0]?.criticalCount).toBe(2);
    expect(r.sellers[0]?.total).toBe(3);
  });

  it('vendas sem custo contam no total mas não na média', () => {
    const r = aggregateMarkupOverview(
      [
        { salesperson_id: 'v1', markup_pct: null },
        { salesperson_id: 'v1', markup_pct: 40 },
      ],
      names,
    );
    expect(r.sellers[0]?.total).toBe(2);
    expect(r.sellers[0]?.average).toBe(40);
  });

  it('vendedor apenas com vendas sem custo tem média nula', () => {
    const r = aggregateMarkupOverview([{ salesperson_id: 'v1', markup_pct: null }], names);
    expect(r.sellers[0]?.average).toBeNull();
    expect(r.sellers[0]?.criticalCount).toBe(0);
  });

  it('ignora vendas sem vendedor no ranking, mas mantém no resumo', () => {
    const r = aggregateMarkupOverview(
      [
        { salesperson_id: null, markup_pct: 90 },
        { salesperson_id: 'v1', markup_pct: 10 },
      ],
      names,
    );
    expect(r.sellers).toHaveLength(1);
    expect(r.summary.total).toBe(2);
  });

  it('id desconhecido vira "Sem vendedor"', () => {
    const r = aggregateMarkupOverview([{ salesperson_id: 'x', markup_pct: 10 }], names);
    expect(r.sellers[0]?.name).toBe('Sem vendedor');
  });

  it('empate de média desempata por nome', () => {
    const r = aggregateMarkupOverview(
      [
        { salesperson_id: 'v2', markup_pct: 30 },
        { salesperson_id: 'v1', markup_pct: 30 },
      ],
      names,
    );
    expect(r.sellers.map((s) => s.name)).toEqual(['Ana', 'Bruno']);
  });
});

describe('buildMarkupSellersCsv', () => {
  it('gera cabeçalho pt-BR e linhas', () => {
    const csv = buildMarkupSellersCsv([
      { salespersonId: 'v1', name: 'Ana', average: 42.5, criticalCount: 1, total: 3 },
    ]);
    expect(csv).toContain('Vendedor;Markup médio;Vendas;Vendas críticas (<20%)');
    expect(csv).toContain('Ana;42,5%;3;1');
  });

  it('média nula vira travessão', () => {
    const csv = buildMarkupSellersCsv([
      { salespersonId: 'v1', name: 'Ana', average: null, criticalCount: 0, total: 1 },
    ]);
    expect(csv).toContain('Ana;—;1;0');
  });
});
