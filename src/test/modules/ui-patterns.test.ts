/**
 * UI Pattern & Component Logic Tests
 * Tests: pagination, filtering, sorting, search, form validation
 */
import { describe, it, expect } from 'vitest';
import { PAGINATION } from '@/constants';

describe('Pagination Logic', () => {
  const paginate = <T>(items: T[], page: number, pageSize: number) => {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);
    return { data, total, totalPages, page, pageSize, hasNext: page < totalPages, hasPrev: page > 1 };
  };

  const items = Array.from({ length: 95 }, (_, i) => ({ id: i + 1 }));

  it('should return first page correctly', () => {
    const result = paginate(items, 1, 20);
    expect(result.data).toHaveLength(20);
    expect(result.total).toBe(95);
    expect(result.totalPages).toBe(5);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(false);
  });

  it('should return last page with partial items', () => {
    const result = paginate(items, 5, 20);
    expect(result.data).toHaveLength(15);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('should return empty for out-of-range page', () => {
    const result = paginate(items, 10, 20);
    expect(result.data).toHaveLength(0);
  });

  it('should handle single page', () => {
    const result = paginate([1, 2, 3], 1, 20);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('should handle empty array', () => {
    const result = paginate([], 1, 20);
    expect(result.data).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it('should use default page size from constants', () => {
    const result = paginate(items, 1, PAGINATION.DEFAULT_PAGE_SIZE);
    expect(result.pageSize).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
  });
});

describe('Search/Filter Logic', () => {
  const data = [
    { id: 1, name: 'João Silva', email: 'joao@test.com', status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@test.com', status: 'active' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@test.com', status: 'inactive' },
    { id: 4, name: 'Ana Lima', email: 'ana@test.com', status: 'active' },
  ];

  const search = (items: typeof data, query: string) =>
    items.filter(i =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.email.toLowerCase().includes(query.toLowerCase())
    );

  const filterByStatus = (items: typeof data, status: string) =>
    items.filter(i => i.status === status);

  it('should find by name', () => {
    expect(search(data, 'João')).toHaveLength(1);
  });

  it('should find by email', () => {
    expect(search(data, 'maria@')).toHaveLength(1);
  });

  it('should be case insensitive', () => {
    expect(search(data, 'PEDRO')).toHaveLength(1);
  });

  it('should return all for empty query', () => {
    expect(search(data, '')).toHaveLength(4);
  });

  it('should return empty for no match', () => {
    expect(search(data, 'xyz')).toHaveLength(0);
  });

  it('should filter by status', () => {
    expect(filterByStatus(data, 'active')).toHaveLength(3);
    expect(filterByStatus(data, 'inactive')).toHaveLength(1);
  });
});

describe('Sorting Logic', () => {
  const items = [
    { name: 'Charlie', amount: 3000 },
    { name: 'Alice', amount: 5000 },
    { name: 'Bob', amount: 1000 },
  ];

  it('should sort by name ascending', () => {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('should sort by amount descending', () => {
    const sorted = [...items].sort((a, b) => b.amount - a.amount);
    expect(sorted[0].amount).toBe(5000);
    expect(sorted[2].amount).toBe(1000);
  });

  it('should handle empty array', () => {
    expect([...[]].sort()).toEqual([]);
  });

  it('should handle single item', () => {
    expect([{ name: 'A' }].sort()).toHaveLength(1);
  });
});

describe('Form Validation Patterns', () => {
  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string): boolean =>
    /^\d{10,11}$/.test(phone.replace(/\D/g, ''));

  const validateRequired = (value: string): boolean =>
    value.trim().length > 0;

  it('should validate correct email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user@test.co')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user')).toBe(false);
    expect(validateEmail('@test.com')).toBe(false);
  });

  it('should validate Brazilian phone numbers', () => {
    expect(validatePhone('11999999999')).toBe(true);
    expect(validatePhone('1199999999')).toBe(true);
    expect(validatePhone('(11) 99999-9999')).toBe(true);
  });

  it('should reject short phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });

  it('should validate required fields', () => {
    expect(validateRequired('test')).toBe(true);
    expect(validateRequired('')).toBe(false);
    expect(validateRequired('   ')).toBe(false);
  });
});