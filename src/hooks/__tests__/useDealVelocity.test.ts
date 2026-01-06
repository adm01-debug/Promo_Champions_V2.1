import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDealVelocity } from '../useDealVelocity';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useDealVelocity', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useDealVelocity(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
