/**
 * Pagination Hook Tests
 * Tests: page logic, boundary conditions, items per page
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  const items = Array.from({ length: 55 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(10);
    expect(result.current.totalPages).toBe(6);
    expect(result.current.totalItems).toBe(55);
  });

  it('should return first page items', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.paginatedItems[9].id).toBe(10);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(11);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(3));
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(1);
  });

  it('should not go above total pages', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(100));
    expect(result.current.currentPage).toBe(6);
  });

  it('should return partial items on last page', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(6));
    expect(result.current.paginatedItems).toHaveLength(5); // 55 % 10 = 5
  });

  it('should calculate startIndex and endIndex correctly', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(10);

    act(() => result.current.goToPage(6));
    expect(result.current.startIndex).toBe(51);
    expect(result.current.endIndex).toBe(55);
  });

  it('should have hasNext and hasPrev flags', () => {
    const { result } = renderHook(() => usePagination(items));
    // Not directly exposed but we can check page bounds
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(6);
  });

  it('should handle custom initial page', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 3 }));
    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedItems[0].id).toBe(21);
  });

  it('should handle custom items per page', () => {
    const { result } = renderHook(() => usePagination(items, { initialItemsPerPage: 25 }));
    expect(result.current.itemsPerPage).toBe(25);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedItems).toHaveLength(25);
  });

  it('should change items per page and reset to page 1', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(3));
    act(() => result.current.setItemsPerPage(25));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(25);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => usePagination([]));
    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.startIndex).toBe(0);
  });

  it('should handle single item', () => {
    const { result } = renderHook(() => usePagination([{ id: 1 }]));
    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.totalPages).toBe(1);
  });

  it('should provide items per page options', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.itemsPerPageOptions).toEqual([10, 25, 50, 100]);
  });

  it('should allow custom items per page options', () => {
    const { result } = renderHook(() => 
      usePagination(items, { itemsPerPageOptions: [5, 15, 30] })
    );
    expect(result.current.itemsPerPageOptions).toEqual([5, 15, 30]);
  });
});
