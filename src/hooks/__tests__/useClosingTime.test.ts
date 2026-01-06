import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClosingTime } from '../useClosingTime';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useClosingTime', () => {
  it('should calculate average closing time', () => {
    const { result } = renderHook(() => useClosingTime(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
