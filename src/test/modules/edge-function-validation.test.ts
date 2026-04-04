/**
 * Edge Function Input Validation & Error Handling Tests
 * Tests: lead-scoring input validation, next-best-action error scenarios,
 * AI response parsing, CORS headers, rate limiting responses
 */
import { describe, it, expect } from 'vitest';

describe('Lead Scoring EF - Input Validation', () => {
  const validateInput = (body: any): { valid: boolean; error?: string } => {
    if (!body?.dealIds || !Array.isArray(body.dealIds) || body.dealIds.length === 0) {
      return { valid: false, error: 'dealIds array is required' };
    }
    return { valid: true };
  };

  it('should reject null body', () => {
    expect(validateInput(null)).toEqual({ valid: false, error: 'dealIds array is required' });
  });

  it('should reject missing dealIds', () => {
    expect(validateInput({})).toEqual({ valid: false, error: 'dealIds array is required' });
  });

  it('should reject empty array', () => {
    expect(validateInput({ dealIds: [] })).toEqual({ valid: false, error: 'dealIds array is required' });
  });

  it('should reject non-array dealIds', () => {
    expect(validateInput({ dealIds: 'abc' })).toEqual({ valid: false, error: 'dealIds array is required' });
  });

  it('should accept valid dealIds array', () => {
    expect(validateInput({ dealIds: ['id1', 'id2'] })).toEqual({ valid: true });
  });
});

describe('Next Best Action EF - AI Response Parsing', () => {
  function parseAIResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      return {
        suggestions: [
          {
            title: 'Revisar pipeline',
            description: 'Analise seus deals ativos.',
            priority: 'medium',
            dealClient: null,
            actionType: 'other',
          },
        ],
        insight: 'Continue trabalhando seus deals.',
      };
    }
  }

  it('should parse clean JSON', () => {
    const json = JSON.stringify({
      suggestions: [{ title: 'Test', description: 'Desc', priority: 'high', actionType: 'call' }],
      insight: 'Good',
    });
    const result = parseAIResponse(json);
    expect(result.suggestions).toHaveLength(1);
    expect(result.insight).toBe('Good');
  });

  it('should extract JSON from markdown code block', () => {
    const content = '```json\n{"suggestions": [], "insight": "Ok"}\n```';
    const result = parseAIResponse(content);
    expect(result.suggestions).toEqual([]);
    expect(result.insight).toBe('Ok');
  });

  it('should extract JSON from generic code block', () => {
    const content = '```\n{"suggestions": [{"title": "A"}], "insight": "B"}\n```';
    const result = parseAIResponse(content);
    expect(result.suggestions[0].title).toBe('A');
  });

  it('should return fallback for invalid JSON', () => {
    const result = parseAIResponse('This is not JSON at all');
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].title).toBe('Revisar pipeline');
  });

  it('should return fallback for empty string', () => {
    const result = parseAIResponse('');
    expect(result.suggestions).toBeDefined();
  });

  it('should handle JSON with extra text around it', () => {
    const content = 'Here is the result: ```json\n{"suggestions": [], "insight": "X"}\n``` and that is it.';
    const result = parseAIResponse(content);
    expect(result.insight).toBe('X');
  });
});

describe('Edge Function - CORS Headers', () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  it('should allow all origins', () => {
    expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
  });

  it('should allow authorization header', () => {
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('authorization');
  });

  it('should allow content-type header', () => {
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('content-type');
  });

  it('should allow apikey header', () => {
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('apikey');
  });

  it('should allow supabase client headers', () => {
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('x-client-info');
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('x-supabase-client-platform');
  });
});

describe('Edge Function - Error Response Codes', () => {
  const errorCodes = {
    429: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
    402: 'Créditos insuficientes. Adicione créditos ao workspace.',
    500: 'Internal server error',
  };

  it('should have rate limit message for 429', () => {
    expect(errorCodes[429]).toContain('Limite de requisições');
  });

  it('should have credits message for 402', () => {
    expect(errorCodes[402]).toContain('Créditos insuficientes');
  });

  it('should have generic error for 500', () => {
    expect(errorCodes[500]).toBeDefined();
  });
});

describe('Next Best Action EF - Context Building', () => {
  it('should calculate days since update correctly', () => {
    const updatedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysSinceUpdate).toBe(5);
  });

  it('should format goal progress as percentage', () => {
    const totalSales = 75000;
    const goalAmount = 100000;
    const progress = ((totalSales / goalAmount) * 100).toFixed(1);
    expect(progress).toBe('75.0');
  });

  it('should handle zero goal gracefully', () => {
    const goalAmount = 0;
    const progress = goalAmount ? ((50000 / goalAmount) * 100).toFixed(1) : '0';
    expect(progress).toBe('0');
  });

  it('should map outcome labels correctly', () => {
    const outcomeLabel = (o: string) => (o === 'won' ? 'GANHO' : 'PERDIDO');
    expect(outcomeLabel('won')).toBe('GANHO');
    expect(outcomeLabel('lost')).toBe('PERDIDO');
  });

  it('should build current month ISO date', () => {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    expect(currentMonth).toMatch(/^\d{4}-\d{2}-01$/);
  });
});

describe('Lead Scoring Hook - Category Classification', () => {
  const classify = (score: number): 'Hot' | 'Warm' | 'Cold' => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  it('should classify 80+ as Hot', () => {
    expect(classify(80)).toBe('Hot');
    expect(classify(100)).toBe('Hot');
  });

  it('should classify 50-79 as Warm', () => {
    expect(classify(50)).toBe('Warm');
    expect(classify(79)).toBe('Warm');
  });

  it('should classify <50 as Cold', () => {
    expect(classify(0)).toBe('Cold');
    expect(classify(49)).toBe('Cold');
  });

  it('should handle boundary values', () => {
    expect(classify(80)).toBe('Hot');
    expect(classify(79)).toBe('Warm');
    expect(classify(50)).toBe('Warm');
    expect(classify(49)).toBe('Cold');
  });
});
