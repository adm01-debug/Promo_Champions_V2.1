import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalespersonCoaching } from '../useSalespersonCoaching';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useSalespersonCoaching', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useSalespersonCoaching(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
