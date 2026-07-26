import { describe, it, expect } from 'vitest';
import {
  buildKpis,
  buildKpiDeltas,
  buildRevenueSeries,
  buildMarkupSeries,
  buildTopProducts,
  buildStatusBreakdown,
  buildTeamRanking,
  buildTopDeals,
  formatBRL,
  STATUS_LABEL,
  type SaleRow,
  type SalespersonRow,
} from './salesReportHelpers';

const sale = (over: Partial<SaleRow>): SaleRow => ({
  id: crypto.randomUUID(),
  amount: 100,
  status: 'completed',
  created_at: '2026-01-15T10:00:00Z',
  client_name: 'Cliente X',
  product_name: 'Produto A',
  salesperson_id: 'sp-1',
  ...over,
});

describe('salesReportHelpers.buildKpis', () => {
  it('agrega apenas vendas ganhas (completed/won/closed) na receita', () => {
    const kpis = buildKpis([
      sale({ amount: 300, status: 'completed' }),
      sale({ amount: 200, status: 'won' }),
      sale({ amount: 500, status: 'closed' }),
      sale({ amount: 999, status: 'pending' }),
      sale({ amount: 999, status: 'lost' }),
    ]);
    expect(kpis.revenue).toBe(1000);
    expect(kpis.salesCount).toBe(3);
    expect(kpis.avgTicket).toBeCloseTo(333.33, 1);
    // 3 ganhas de 5 totais = 60%
    expect(kpis.conversionRate).toBe(60);
  });

  it('devolve zeros num array vazio', () => {
    expect(buildKpis([])).toEqual({
      revenue: 0,
      salesCount: 0,
      avgTicket: 0,
      conversionRate: 0,
      avgMarkup: 0,
      markupSample: 0,
    });

  });

  it('trata amount nulo como zero', () => {
    const kpis = buildKpis([sale({ amount: null, status: 'won' })]);
    expect(kpis.revenue).toBe(0);
    expect(kpis.avgTicket).toBe(0);
    expect(kpis.salesCount).toBe(1);
  });
});

describe('salesReportHelpers.buildKpis markup', () => {
  it('ignora vendas sem custo e vendas não ganhas no markup médio', () => {
    const kpis = buildKpis([
      sale({ status: 'completed', amount: 100, markup_pct: 50 }),
      sale({ status: 'completed', amount: 100, markup_pct: 30 }),
      sale({ status: 'completed', amount: 100, markup_pct: null }),
      sale({ status: 'pending', amount: 100, markup_pct: 999 }),
    ]);
    expect(kpis.markupSample).toBe(2);
    expect(kpis.avgMarkup).toBe(40);
  });

  it('retorna zero quando nenhuma venda tem custo', () => {
    const kpis = buildKpis([sale({ status: 'completed', amount: 100, markup_pct: null })]);
    expect(kpis.markupSample).toBe(0);
    expect(kpis.avgMarkup).toBe(0);
  });
});

describe('salesReportHelpers.buildKpiDeltas', () => {
  const base = { revenue: 0, salesCount: 0, avgTicket: 0, conversionRate: 0, avgMarkup: 0, markupSample: 0 };

  it('calcula variação percentual quando existe base', () => {
    const d = buildKpiDeltas(
      { ...base, revenue: 1500, salesCount: 15, avgTicket: 100, conversionRate: 50 },
      { ...base, revenue: 1000, salesCount: 10, avgTicket: 100, conversionRate: 40 },
    );
    expect(d.revenueDelta).toBe(50);
    expect(d.salesCountDelta).toBe(50);
    expect(d.avgTicketDelta).toBe(0);
    expect(d.conversionRateDelta).toBe(25);
  });

  it('retorna 100% quando base é zero e current é positivo', () => {
    const d = buildKpiDeltas({ ...base, revenue: 500 }, base);
    expect(d.revenueDelta).toBe(100);
  });

  it('retorna 0 quando ambos são zero', () => {
    expect(buildKpiDeltas(base, base).revenueDelta).toBe(0);
  });

  it('calcula delta de markup médio', () => {
    const d = buildKpiDeltas({ ...base, avgMarkup: 60 }, { ...base, avgMarkup: 40 });
    expect(d.avgMarkupDelta).toBe(50);
  });
});

describe('salesReportHelpers.buildRevenueSeries', () => {
  const start = new Date('2026-01-05T00:00:00Z');
  const end = new Date('2026-01-11T00:00:00Z');

  it('weekly trata amount nulo como zero (linha 128)', () => {
    const series = buildRevenueSeries(
      [sale({ amount: null, status: 'completed', created_at: '2026-01-05T09:00:00Z' })],
      'weekly',
      start,
      end,
    );
    expect(series[0].value).toBe(0);
  });

  it('weekly retorna 1 ponto por dia com receita agregada', () => {
    const series = buildRevenueSeries(
      [
        sale({ amount: 100, status: 'completed', created_at: '2026-01-05T09:00:00Z' }),
        sale({ amount: 250, status: 'won', created_at: '2026-01-05T14:00:00Z' }),
        sale({ amount: 700, status: 'lost', created_at: '2026-01-06T09:00:00Z' }),
      ],
      'weekly',
      start,
      end,
    );
    expect(series).toHaveLength(7);
    // primeiro dia soma 350 (2 ganhas)
    expect(series[0].value).toBe(350);
    // dia da perda não conta
    expect(series[1].value).toBe(0);
  });

  it('monthly agrupa por semanas ISO', () => {
    const series = buildRevenueSeries(
      [sale({ amount: 999, status: 'completed', created_at: '2026-01-05T09:00:00Z' })],
      'monthly',
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-31T00:00:00Z'),
    );
    expect(series.length).toBeGreaterThanOrEqual(4);
    expect(series[0].name).toMatch(/Sem 1/);
    const total = series.reduce((a, p) => a + p.value, 0);
    expect(total).toBe(999);
  });

  it('monthly trata amount nulo como zero (linha 138)', () => {
    const series = buildRevenueSeries(
      [sale({ amount: null, status: 'completed', created_at: '2026-01-05T09:00:00Z' })],
      'monthly',
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-31T00:00:00Z'),
    );
    const total = series.reduce((a, p) => a + p.value, 0);
    expect(total).toBe(0);
  });
});

describe('salesReportHelpers.buildTopProducts', () => {
  it('ordena por soma decrescente e limita ao topN', () => {
    const result = buildTopProducts(
      [
        sale({ product_name: 'A', amount: 100 }),
        sale({ product_name: 'B', amount: 500 }),
        sale({ product_name: 'A', amount: 300 }),
        sale({ product_name: 'C', amount: 50 }),
      ],
      2,
    );
    expect(result).toEqual([
      { name: 'B', value: 500 },
      { name: 'A', value: 400 },
    ]);
  });

  it('usa "—" para produto sem nome e ignora vendas não-ganhas', () => {
    const result = buildTopProducts([
      sale({ product_name: null, amount: 100 }),
      sale({ product_name: 'X', amount: 999, status: 'lost' }),
    ]);
    expect(result).toEqual([{ name: '—', value: 100 }]);
  });

  it('trata amount nulo como zero em venda ganha (linha 149)', () => {
    const result = buildTopProducts([
      sale({ product_name: 'A', amount: null }),
    ]);
    expect(result).toEqual([{ name: 'A', value: 0 }]);
  });
});

describe('salesReportHelpers.buildStatusBreakdown', () => {
  it('conta ocorrências e mapeia label pt-BR', () => {
    const r = buildStatusBreakdown([
      sale({ status: 'completed' }),
      sale({ status: 'completed' }),
      sale({ status: 'pending' }),
      sale({ status: null }),
    ]);
    const completed = r.find((x) => x.key === 'completed');
    expect(completed).toEqual({ key: 'completed', name: STATUS_LABEL.completed, value: 2 });
    const outros = r.find((x) => x.key === 'outros');
    expect(outros?.value).toBe(1);
  });

  it('preserva key desconhecida como label quando não há mapeamento', () => {
    const r = buildStatusBreakdown([sale({ status: 'exotic-status' })]);
    expect(r[0].name).toBe('exotic-status');
  });
});

describe('salesReportHelpers.buildTeamRanking', () => {
  const people: SalespersonRow[] = [
    { id: 'sp-1', name: 'Ana' },
    { id: 'sp-2', name: 'Bruno' },
  ];

  it('ordena por receita ganha por vendedor', () => {
    const r = buildTeamRanking(
      [
        sale({ salesperson_id: 'sp-1', amount: 500 }),
        sale({ salesperson_id: 'sp-2', amount: 300 }),
        sale({ salesperson_id: 'sp-2', amount: 900 }),
        sale({ salesperson_id: 'sp-1', amount: 999, status: 'lost' }),
      ],
      people,
    );
    expect(r).toEqual([
      { name: 'Bruno', value: 1200 },
      { name: 'Ana', value: 500 },
    ]);
  });

  it('marca vendedor não cadastrado como Desconhecido', () => {
    const r = buildTeamRanking([sale({ salesperson_id: 'sp-999', amount: 100 })], people);
    expect(r[0].name).toBe('Desconhecido');
  });

  it('ignora vendas sem salesperson_id', () => {
    const r = buildTeamRanking([sale({ salesperson_id: null, amount: 100 })], people);
    expect(r).toEqual([]);
  });

  it('trata amount nulo como zero (linha 180)', () => {
    const r = buildTeamRanking([sale({ salesperson_id: 'sp-1', amount: null })], people);
    expect(r).toEqual([{ name: 'Ana', value: 0 }]);
  });
});

describe('salesReportHelpers.buildTopDeals', () => {
  it('ordena por amount desc e limita', () => {
    const people: SalespersonRow[] = [{ id: 'sp-1', name: 'Ana' }];
    const r = buildTopDeals(
      [
        sale({ amount: 100, client_name: 'C1' }),
        sale({ amount: 900, client_name: 'C2' }),
        sale({ amount: 500, client_name: 'C3' }),
      ],
      people,
      2,
    );
    expect(r).toHaveLength(2);
    expect(r[0].client).toBe('C2');
    expect(r[0].amount).toBe(900);
    expect(r[0].salesperson).toBe('Ana');
  });

  it('usa placeholder para campos faltantes', () => {
    const r = buildTopDeals(
      [sale({ client_name: null, product_name: null, salesperson_id: null, amount: null, status: null })],
      [],
    );
    expect(r[0]).toEqual({
      client: '—',
      product: '—',
      salesperson: '—',
      amount: 0,
      status: '—',
      markupPct: null,
    });

  });

  it('ordena corretamente com amounts nulos em múltiplos registros (linha 197)', () => {
    const people: SalespersonRow[] = [];
    const r = buildTopDeals(
      [
        sale({ client_name: 'C1', amount: null }),
        sale({ client_name: 'C2', amount: null }),
      ],
      people,
    );
    expect(r).toHaveLength(2);
    expect(r[0].amount).toBe(0);
    expect(r[1].amount).toBe(0);
  });
});

describe('salesReportHelpers.formatBRL', () => {
  it('formata moeda brasileira sem casas decimais', () => {
    expect(formatBRL(1234)).toContain('R$');
    expect(formatBRL(1234)).toContain('1.234');
  });

  it('trata zero e negativos', () => {
    expect(formatBRL(0)).toMatch(/0/);
    expect(formatBRL(-100)).toContain('-');
  });
});

describe('buildMarkupSeries', () => {
  const mk = (id: string, created_at: string, markup_pct: number | null, status = 'completed'): SaleRow => ({
    id,
    amount: 100,
    status,
    created_at,
    client_name: 'C',
    product_name: 'P',
    salesperson_id: 's1',
    markup_pct,
  });

  it('agrega média diária no período semanal e usa null em buckets vazios', () => {
    const start = new Date('2026-07-20T00:00:00');
    const end = new Date('2026-07-26T23:59:59');
    const series = buildMarkupSeries(
      [
        mk('1', '2026-07-20T10:00:00', 30),
        mk('2', '2026-07-20T14:00:00', 50),
        mk('3', '2026-07-22T09:00:00', 10),
      ],
      'weekly',
      start,
      end,
    );
    expect(series).toHaveLength(7);
    expect(series[0].value).toBe(40);
    expect(series[0].sample).toBe(2);
    expect(series[1].value).toBeNull();
    expect(series[1].sample).toBe(0);
    expect(series[2].value).toBe(10);
  });

  it('ignora vendas não ganhas e sem custo', () => {
    const start = new Date('2026-07-20T00:00:00');
    const end = new Date('2026-07-26T23:59:59');
    const series = buildMarkupSeries(
      [
        mk('1', '2026-07-20T10:00:00', 80, 'cancelled'),
        mk('2', '2026-07-20T11:00:00', null),
        mk('3', '2026-07-20T12:00:00', 25),
      ],
      'weekly',
      start,
      end,
    );
    expect(series[0].value).toBe(25);
    expect(series[0].sample).toBe(1);
  });

  it('agrega por semana no período mensal', () => {
    const start = new Date('2026-07-01T00:00:00');
    const end = new Date('2026-07-31T23:59:59');
    const series = buildMarkupSeries([mk('1', '2026-07-02T10:00:00', 45)], 'monthly', start, end);
    expect(series.length).toBeGreaterThan(3);
    expect(series.some((p) => p.value === 45)).toBe(true);
  });
});

describe('buildMarkupRanking', () => {
  const people = [
    { id: 'p1', name: 'Ana' },
    { id: 'p2', name: 'Bruno' },
  ];
  const sale = (
    id: string,
    salesperson_id: string | null,
    markup_pct: number | null,
    status = 'completed',
    amount = 1000,
  ): SaleRow => ({
    id,
    amount,
    status,
    created_at: '2026-07-20T10:00:00',
    client_name: 'C',
    product_name: 'P',
    salesperson_id,
    markup_pct,
  });

  it('ordena por markup médio decrescente e calcula amostra/receita', () => {
    const rows = buildMarkupRanking(
      [
        sale('1', 'p1', 20),
        sale('2', 'p1', 40),
        sale('3', 'p2', 50, 'completed', 2000),
      ],
      people,
    );
    expect(rows.map((r) => r.name)).toEqual(['Bruno', 'Ana']);
    expect(rows[1].avgMarkup).toBe(30);
    expect(rows[1].sample).toBe(2);
    expect(rows[0].revenue).toBe(2000);
  });

  it('ignora vendas não ganhas, sem custo ou sem vendedor', () => {
    const rows = buildMarkupRanking(
      [
        sale('1', 'p1', 30, 'cancelled'),
        sale('2', 'p1', null),
        sale('3', null, 60),
      ],
      people,
    );
    expect(rows).toHaveLength(0);
  });

  it('resolve vendedor desconhecido e respeita topN', () => {
    const rows = buildMarkupRanking([sale('1', 'px', 15), sale('2', 'p1', 10)], people, 1);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Desconhecido');
  });
});
