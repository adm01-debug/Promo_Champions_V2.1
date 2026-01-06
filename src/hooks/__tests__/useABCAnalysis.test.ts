import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useABCAnalysis } from '../useABCAnalysis';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useABCAnalysis', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
