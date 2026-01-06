import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadScoring } from '../useLeadScoring';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useLeadScoring', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useLeadScoring(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
