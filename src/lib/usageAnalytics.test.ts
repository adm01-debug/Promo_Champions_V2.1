import { describe, expect, it } from 'vitest';
import {
  aggregatePageViews,
  aggregateUserActivity,
  type AnalyticsEvent,
} from './usageAnalytics';

const events: AnalyticsEvent[] = [
  { route: '/vendas', salesperson_id: 'ana', entered_at: '2026-09-10T10:00:00.000Z' },
  { route: '/vendas', salesperson_id: 'ana', entered_at: '2026-09-10T11:00:00.000Z' },
  { route: '/clientes', salesperson_id: 'bruno', entered_at: '2026-09-10T12:00:00.000Z' },
  { route: '/clientes', salesperson_id: null, entered_at: '2026-09-10T13:00:00.000Z' },
];

describe('usage analytics', () => {
  it('agrega visualizações a partir de eventos reais', () => {
    expect(aggregatePageViews(events)).toEqual([
      { path: '/clientes', count: 2 },
      { path: '/vendas', count: 2 },
    ]);
  });

  it('mantém somente a última atividade observada por usuário', () => {
    expect(
      aggregateUserActivity(
        events,
        new Map([
          ['ana', 'Ana'],
          ['bruno', 'Bruno'],
        ])
      )
    ).toEqual([
      { user_id: 'bruno', name: 'Bruno', last_active: '2026-09-10T12:00:00.000Z' },
      { user_id: 'ana', name: 'Ana', last_active: '2026-09-10T11:00:00.000Z' },
    ]);
  });
});
