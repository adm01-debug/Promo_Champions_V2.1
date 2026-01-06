import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNextBestAction } from '../useNextBestAction';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useNextBestAction', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useNextBestAction(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
