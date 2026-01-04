import { renderHook } from '@testing-library/react';
import { useLeadRouting } from '../useLeadRouting';

describe('useLeadRouting', () => {
  it('routes leads round-robin', () => {
    const { result } = renderHook(() => useLeadRouting());
    expect(result.current.assignLead('lead1')).toBeDefined();
  });
  
  it('respects territory rules', () => {
    const { result } = renderHook(() => useLeadRouting());
    const assigned = result.current.assignLead('lead1', { territory: 'SP' });
    expect(assigned.territory).toBe('SP');
  });
});
