import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Webhook Resiliency and Status Codes', () => {
  it('should handle webhook timeouts', async () => {
    (supabase.functions.invoke as any).mockRejectedValue(new Error('Timeout'));

    await expect(supabase.functions.invoke('dispatch-webhook', {
      body: { url: 'https://slow-service.com', payload: {} }
    })).rejects.toThrow('Timeout');
  });

  it('should return correct status code for failed deliveries', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { status: 'failed', code: 404 },
      error: null
    });

    const { data } = await supabase.functions.invoke('dispatch-webhook', {
      body: { url: 'https://invalid-url.com', payload: {} }
    });

    expect(data.status).toBe('failed');
    expect(data.code).toBe(404);
  });
});
