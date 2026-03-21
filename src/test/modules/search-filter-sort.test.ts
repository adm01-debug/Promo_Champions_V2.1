/**
 * Search, Filter & Sort Tests
 * Tests: fuzzy search, multi-filter, sort stability, pagination
 */
import { describe, it, expect } from 'vitest';

describe('Search - Text Matching', () => {
  const searchItems = <T extends Record<string, any>>(items: T[], query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      fields.some(f => String(item[f]).toLowerCase().includes(q))
    );
  };

  const items = [
    { id: 1, name: 'João Silva', email: 'joao@test.com', company: 'TechCorp' },
    { id: 2, name: 'Maria Santos', email: 'maria@test.com', company: 'HealthPlus' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@tech.com', company: 'TechStart' },
  ];

  it('should search by name', () => {
    expect(searchItems(items, 'joão', ['name'])).toHaveLength(1);
  });

  it('should search across multiple fields', () => {
    expect(searchItems(items, 'tech', ['name', 'email', 'company'])).toHaveLength(2);
  });

  it('should return all for empty query', () => {
    expect(searchItems(items, '', ['name'])).toHaveLength(3);
  });

  it('should return empty for no match', () => {
    expect(searchItems(items, 'xyz', ['name'])).toHaveLength(0);
  });

  it('should be case insensitive', () => {
    expect(searchItems(items, 'MARIA', ['name'])).toHaveLength(1);
  });
});

describe('Filter - Multi-Criteria', () => {
  type Filter = { field: string; operator: 'eq' | 'gt' | 'lt' | 'in'; value: any };

  const applyFilters = <T extends Record<string, any>>(items: T[], filters: Filter[]): T[] => {
    return items.filter(item =>
      filters.every(f => {
        const val = item[f.field];
        switch (f.operator) {
          case 'eq': return val === f.value;
          case 'gt': return val > f.value;
          case 'lt': return val < f.value;
          case 'in': return Array.isArray(f.value) && f.value.includes(val);
          default: return true;
        }
      })
    );
  };

  const data = [
    { name: 'A', status: 'active', amount: 5000, category: 'tech' },
    { name: 'B', status: 'inactive', amount: 15000, category: 'health' },
    { name: 'C', status: 'active', amount: 25000, category: 'tech' },
    { name: 'D', status: 'active', amount: 8000, category: 'retail' },
  ];

  it('should filter by equality', () => {
    expect(applyFilters(data, [{ field: 'status', operator: 'eq', value: 'active' }])).toHaveLength(3);
  });

  it('should filter by greater than', () => {
    expect(applyFilters(data, [{ field: 'amount', operator: 'gt', value: 10000 }])).toHaveLength(2);
  });

  it('should filter by IN operator', () => {
    expect(applyFilters(data, [{ field: 'category', operator: 'in', value: ['tech', 'health'] }])).toHaveLength(3);
  });

  it('should combine multiple filters', () => {
    const result = applyFilters(data, [
      { field: 'status', operator: 'eq', value: 'active' },
      { field: 'amount', operator: 'gt', value: 10000 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('C');
  });

  it('should return all with no filters', () => {
    expect(applyFilters(data, [])).toHaveLength(4);
  });
});

describe('Sort - Multi-Column', () => {
  const sortItems = <T extends Record<string, any>>(items: T[], sortBy: { field: string; direction: 'asc' | 'desc' }[]): T[] => {
    return [...items].sort((a, b) => {
      for (const { field, direction } of sortBy) {
        const aVal = a[field]; const bVal = b[field];
        let cmp = 0;
        if (typeof aVal === 'string') cmp = aVal.localeCompare(bVal);
        else cmp = aVal - bVal;
        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  };

  const items = [
    { name: 'A', amount: 100, date: '2024-01-03' },
    { name: 'B', amount: 200, date: '2024-01-01' },
    { name: 'C', amount: 100, date: '2024-01-02' },
  ];

  it('should sort by single column asc', () => {
    const sorted = sortItems(items, [{ field: 'amount', direction: 'asc' }]);
    expect(sorted[0].amount).toBe(100);
  });

  it('should sort by single column desc', () => {
    const sorted = sortItems(items, [{ field: 'amount', direction: 'desc' }]);
    expect(sorted[0].amount).toBe(200);
  });

  it('should sort by multiple columns', () => {
    const sorted = sortItems(items, [
      { field: 'amount', direction: 'asc' },
      { field: 'date', direction: 'asc' },
    ]);
    expect(sorted[0].name).toBe('C'); // amount 100, earlier date
    expect(sorted[1].name).toBe('A'); // amount 100, later date
  });
});

describe('Pagination - Offset Based', () => {
  const paginate = <T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } => {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return {
      data: items.slice(start, start + pageSize),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  };

  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('should return first page', () => {
    const result = paginate(items, 1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(false);
  });

  it('should return last page with remainder', () => {
    const result = paginate(items, 3, 10);
    expect(result.data).toHaveLength(5);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('should calculate total pages', () => {
    expect(paginate(items, 1, 10).totalPages).toBe(3);
  });

  it('should handle empty data', () => {
    const result = paginate([], 1, 10);
    expect(result.data).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

describe('Search - Highlight Matches', () => {
  const highlightMatch = (text: string, query: string): string => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  it('should highlight matches', () => {
    expect(highlightMatch('João da Silva', 'silva')).toBe('João da <mark>Silva</mark>');
  });

  it('should handle no matches', () => {
    expect(highlightMatch('João', 'xyz')).toBe('João');
  });

  it('should handle empty query', () => {
    expect(highlightMatch('João', '')).toBe('João');
  });

  it('should escape regex chars', () => {
    expect(highlightMatch('price (USD)', '(usd)')).toBe('price <mark>(USD)</mark>');
  });
});

describe('Filter - Date Range', () => {
  const filterByDateRange = <T extends { date: string }>(items: T[], start?: string, end?: string): T[] => {
    return items.filter(item => {
      if (start && item.date < start) return false;
      if (end && item.date > end) return false;
      return true;
    });
  };

  const items = [
    { id: 1, date: '2024-01-15' },
    { id: 2, date: '2024-02-10' },
    { id: 3, date: '2024-03-20' },
    { id: 4, date: '2024-04-05' },
  ];

  it('should filter by start date', () => {
    expect(filterByDateRange(items, '2024-03-01')).toHaveLength(2);
  });

  it('should filter by end date', () => {
    expect(filterByDateRange(items, undefined, '2024-02-28')).toHaveLength(2);
  });

  it('should filter by range', () => {
    expect(filterByDateRange(items, '2024-02-01', '2024-03-31')).toHaveLength(2);
  });

  it('should return all with no dates', () => {
    expect(filterByDateRange(items)).toHaveLength(4);
  });
});
