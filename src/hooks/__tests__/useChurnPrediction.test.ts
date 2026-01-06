import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChurnPrediction } from '../useChurnPrediction';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useChurnPrediction', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useChurnPrediction(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
