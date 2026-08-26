import { describe, expect, it } from 'vitest';
import { assignLeadRoundRobin } from './useLeadAssignment';

const salespeople = [
  { id: 'seller-1', name: 'Vendedor 1', weight: 1 },
  { id: 'seller-2', name: 'Vendedor 2', weight: 1 },
];

describe('assignLeadRoundRobin', () => {
  it('não mantém cursor de round-robin no módulo do navegador', () => {
    expect(assignLeadRoundRobin(salespeople)).toMatchObject({
      salesperson_id: 'seller-1',
    });
    expect(assignLeadRoundRobin(salespeople)).toMatchObject({
      salesperson_id: 'seller-1',
    });
    expect(assignLeadRoundRobin(salespeople, 'round_robin', 1)).toMatchObject({
      salesperson_id: 'seller-2',
    });
  });
});
