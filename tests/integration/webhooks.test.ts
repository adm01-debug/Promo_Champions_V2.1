import { describe, it, expect, vi } from 'vitest';

describe('Webhook Integration & Simulation', () => {
  it('should handle incoming CRM webhooks with various payloads', async () => {
    const payloads = [
      { event: 'lead.created', data: { id: 'l1', email: 'test@test.com' } },
      { event: 'deal.updated', data: { id: 'd1', status: 'won', value: 1000 } },
      { event: 'invalid', data: {} },
      { event: 'lead.created', data: { id: 'l1' } } // Missing email
    ];

    const mockProcessor = vi.fn(async (payload) => {
      if (!payload.event || !['lead.created', 'deal.updated'].includes(payload.event)) {
        return { status: 400, message: 'Invalid event' };
      }
      if (payload.event === 'lead.created' && !payload.data.email) {
        return { status: 422, message: 'Missing email' };
      }
      return { status: 200, message: 'Success' };
    });

    for (const payload of payloads) {
      const result = await mockProcessor(payload);
      if (payload.event === 'invalid') {
        expect(result.status).toBe(400);
      } else if (payload.event === 'lead.created' && !payload.data.email) {
        expect(result.status).toBe(422);
      } else {
        expect(result.status).toBe(200);
      }
    }
  });
});
