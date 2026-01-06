import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversionAnalysis } from '../useConversionAnalysis';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useConversionAnalysis', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useConversionAnalysis(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
