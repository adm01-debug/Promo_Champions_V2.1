/**
 * Kanban & Client Board Logic Tests
 * Tests: column grouping, drag-drop state, card ordering
 */
import { describe, it, expect } from 'vitest';

describe('Kanban - Column Grouping', () => {
  const groupByStatus = <T extends { status: string }>(items: T[]): Map<string, T[]> => {
    const map = new Map<string, T[]>();
    items.forEach(item => {
      const group = map.get(item.status) || [];
      group.push(item);
      map.set(item.status, group);
    });
    return map;
  };

  it('should group items by status', () => {
    const items = [
      { id: '1', status: 'pending', name: 'A' },
      { id: '2', status: 'active', name: 'B' },
      { id: '3', status: 'pending', name: 'C' },
    ];
    const grouped = groupByStatus(items);
    expect(grouped.get('pending')).toHaveLength(2);
    expect(grouped.get('active')).toHaveLength(1);
  });

  it('should handle empty items', () => {
    expect(groupByStatus([]).size).toBe(0);
  });

  it('should handle single status', () => {
    const items = [
      { id: '1', status: 'new' },
      { id: '2', status: 'new' },
    ];
    expect(groupByStatus(items).size).toBe(1);
  });
});

describe('Kanban - Card Ordering', () => {
  const reorder = <T>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  it('should move item forward', () => {
    expect(reorder(['A', 'B', 'C', 'D'], 0, 2)).toEqual(['B', 'C', 'A', 'D']);
  });

  it('should move item backward', () => {
    expect(reorder(['A', 'B', 'C', 'D'], 3, 1)).toEqual(['A', 'D', 'B', 'C']);
  });

  it('should handle same position', () => {
    expect(reorder(['A', 'B', 'C'], 1, 1)).toEqual(['A', 'B', 'C']);
  });
});

describe('Kanban - Column Value Total', () => {
  const calculateColumnTotal = (items: { amount: number }[]): number => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  it('should sum all amounts', () => {
    expect(calculateColumnTotal([
      { amount: 1000 },
      { amount: 2000 },
      { amount: 3000 },
    ])).toBe(6000);
  });

  it('should handle empty column', () => {
    expect(calculateColumnTotal([])).toBe(0);
  });

  it('should handle zero amounts', () => {
    expect(calculateColumnTotal([{ amount: 0 }, { amount: 0 }])).toBe(0);
  });
});

describe('Kanban - Status Transitions', () => {
  const CLIENT_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

  const canMoveToStatus = (currentStatus: string, targetStatus: string): boolean => {
    const currentIdx = CLIENT_STATUSES.indexOf(currentStatus);
    const targetIdx = CLIENT_STATUSES.indexOf(targetStatus);
    if (currentIdx === -1 || targetIdx === -1) return false;
    // Can move forward or one step back
    return targetIdx <= currentIdx + 1 && targetIdx >= currentIdx - 1;
  };

  it('should allow forward movement', () => {
    expect(canMoveToStatus('new', 'contacted')).toBe(true);
  });

  it('should allow one step back', () => {
    expect(canMoveToStatus('qualified', 'contacted')).toBe(true);
  });

  it('should reject large jumps forward', () => {
    expect(canMoveToStatus('new', 'won')).toBe(false);
  });

  it('should reject large jumps backward', () => {
    expect(canMoveToStatus('negotiation', 'new')).toBe(false);
  });
});

describe('Kanban - Column Count Badge', () => {
  const formatCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  it('should show exact count under 100', () => {
    expect(formatCount(5)).toBe('5');
    expect(formatCount(99)).toBe('99');
  });

  it('should show 99+ for 100+', () => {
    expect(formatCount(100)).toBe('99+');
    expect(formatCount(500)).toBe('99+');
  });

  it('should show 0', () => {
    expect(formatCount(0)).toBe('0');
  });
});

describe('Kanban - Search Filtering', () => {
  const filterCards = (cards: { name: string; company?: string }[], query: string) => {
    if (!query.trim()) return cards;
    const q = query.toLowerCase();
    return cards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  };

  it('should filter by name', () => {
    const cards = [{ name: 'João' }, { name: 'Maria' }];
    expect(filterCards(cards, 'joão')).toHaveLength(1);
  });

  it('should filter by company', () => {
    const cards = [{ name: 'João', company: 'ABC Corp' }];
    expect(filterCards(cards, 'abc')).toHaveLength(1);
  });

  it('should return all for empty query', () => {
    const cards = [{ name: 'A' }, { name: 'B' }];
    expect(filterCards(cards, '')).toHaveLength(2);
  });

  it('should be case insensitive', () => {
    expect(filterCards([{ name: 'TESTE' }], 'teste')).toHaveLength(1);
  });
});
