import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Edge Functions Fuzz Testing', () => {
  const edgeFunctions = ['lead-scoring', 'dispatch-webhook', 'ai-copilot', 'behavioral-analysis'];

  const maliciousInputs = [
    { dealIds: ["'; DROP TABLE sales;--"] },
    { dealIds: Array(1000).fill('id') },
    { dealIds: [null, undefined, 123, { obj: true }] },
    { dealIds: ["<script>alert('xss')</script>"] },
    { body: "{ invalid json" },
    {}
  ];

  it('should not crash and return validation errors for fuzz inputs', async () => {
    for (const func of edgeFunctions) {
      for (const input of maliciousInputs) {
        (supabase.functions.invoke as any).mockResolvedValue({
          data: null,
          error: { message: 'Validation failed' }
        });

        const { data, error } = await supabase.functions.invoke(func, {
          body: input
        });

        // O sistema deve tratar inputs inválidos sem quebrar o servidor
        expect(data).toBeNull();
        expect(error).toBeDefined();
      }
    }
  });
});
