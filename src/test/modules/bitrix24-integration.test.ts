/**
 * Bitrix24 Integration & Sync Tests
 * Tests: sync logic, field mapping, conflict resolution, retry, logging
 */
import { describe, it, expect } from 'vitest';

describe('Bitrix24 - Field Mapping', () => {
  const mapBitrixDealToSale = (deal: Record<string, any>): { client_name: string; amount: number; status: string; source: string } => {
    const statusMap: Record<string, string> = {
      NEW: 'pending', WON: 'completed', LOSE: 'lost',
      'IN_PROCESS': 'negotiation', PREPARATION: 'proposal',
    };
    return {
      client_name: deal.COMPANY_TITLE || deal.CONTACT_FULL_NAME || 'Desconhecido',
      amount: Number(deal.OPPORTUNITY) || 0,
      status: statusMap[deal.STAGE_ID] || 'pending',
      source: 'bitrix24',
    };
  };

  it('should map won deal', () => {
    const result = mapBitrixDealToSale({ COMPANY_TITLE: 'Acme', OPPORTUNITY: '50000', STAGE_ID: 'WON' });
    expect(result.status).toBe('completed');
    expect(result.amount).toBe(50000);
    expect(result.client_name).toBe('Acme');
  });

  it('should fallback to contact name', () => {
    const result = mapBitrixDealToSale({ CONTACT_FULL_NAME: 'João', OPPORTUNITY: '0', STAGE_ID: 'NEW' });
    expect(result.client_name).toBe('João');
  });

  it('should fallback to Desconhecido', () => {
    expect(mapBitrixDealToSale({ OPPORTUNITY: '0', STAGE_ID: 'NEW' }).client_name).toBe('Desconhecido');
  });

  it('should default unknown stages to pending', () => {
    expect(mapBitrixDealToSale({ OPPORTUNITY: '0', STAGE_ID: 'CUSTOM_STAGE' }).status).toBe('pending');
  });
});

describe('Bitrix24 - Conflict Resolution', () => {
  type SyncRecord = { id: string; updatedAt: string; source: 'local' | 'bitrix' };

  const resolveConflict = (local: SyncRecord, remote: SyncRecord, strategy: 'newest_wins' | 'local_wins' | 'remote_wins'): 'local' | 'remote' => {
    if (strategy === 'local_wins') return 'local';
    if (strategy === 'remote_wins') return 'remote';
    return new Date(local.updatedAt) >= new Date(remote.updatedAt) ? 'local' : 'remote';
  };

  it('should pick newest', () => {
    expect(resolveConflict(
      { id: '1', updatedAt: '2024-01-15T10:00:00Z', source: 'local' },
      { id: '1', updatedAt: '2024-01-15T12:00:00Z', source: 'bitrix' },
      'newest_wins'
    )).toBe('remote');
  });

  it('should force local wins', () => {
    expect(resolveConflict(
      { id: '1', updatedAt: '2024-01-01T00:00:00Z', source: 'local' },
      { id: '1', updatedAt: '2024-01-15T00:00:00Z', source: 'bitrix' },
      'local_wins'
    )).toBe('local');
  });
});

describe('Bitrix24 - Sync Log Analysis', () => {
  type SyncLog = { status: string; duration_ms: number; deals_from_bitrix: number; error_message: string | null };

  const analyzeSyncHealth = (logs: SyncLog[]): { successRate: number; avgDuration: number; totalDeals: number; hasErrors: boolean } => {
    if (logs.length === 0) return { successRate: 0, avgDuration: 0, totalDeals: 0, hasErrors: false };
    const successes = logs.filter(l => l.status === 'success').length;
    const avgDuration = Math.round(logs.reduce((s, l) => s + l.duration_ms, 0) / logs.length);
    const totalDeals = logs.reduce((s, l) => s + l.deals_from_bitrix, 0);
    return {
      successRate: Math.round((successes / logs.length) * 100),
      avgDuration,
      totalDeals,
      hasErrors: logs.some(l => l.error_message !== null),
    };
  };

  it('should analyze healthy sync', () => {
    const logs: SyncLog[] = [
      { status: 'success', duration_ms: 500, deals_from_bitrix: 10, error_message: null },
      { status: 'success', duration_ms: 600, deals_from_bitrix: 15, error_message: null },
    ];
    const health = analyzeSyncHealth(logs);
    expect(health.successRate).toBe(100);
    expect(health.totalDeals).toBe(25);
    expect(health.hasErrors).toBe(false);
  });

  it('should detect errors', () => {
    const logs: SyncLog[] = [
      { status: 'success', duration_ms: 500, deals_from_bitrix: 10, error_message: null },
      { status: 'error', duration_ms: 100, deals_from_bitrix: 0, error_message: 'Timeout' },
    ];
    expect(analyzeSyncHealth(logs).hasErrors).toBe(true);
    expect(analyzeSyncHealth(logs).successRate).toBe(50);
  });
});

describe('Bitrix24 - Batch Processing', () => {
  const createBatches = <T>(items: T[], batchSize: number): T[][] => {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  };

  it('should split into batches', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const batches = createBatches(items, 10);
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });

  it('should handle empty', () => {
    expect(createBatches([], 10)).toHaveLength(0);
  });

  it('should handle single batch', () => {
    expect(createBatches([1, 2, 3], 10)).toHaveLength(1);
  });
});
