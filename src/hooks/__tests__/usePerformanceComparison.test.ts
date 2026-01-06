import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePerformanceComparison } from '../usePerformanceComparison';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('usePerformanceComparison', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => usePerformanceComparison(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
