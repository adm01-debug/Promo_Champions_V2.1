import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFunnelData } from '../useFunnelData';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useFunnelData', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useFunnelData(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
