/**
 * Error Handling & Resilience Tests
 * Tests: error boundaries, retry logic, graceful degradation, error formatting
 */
import { describe, it, expect } from 'vitest';

describe('Error - User-Friendly Messages', () => {
  const formatError = (error: unknown): { title: string; message: string; code: string } => {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { title: 'Sem conexão', message: 'Verifique sua internet e tente novamente.', code: 'NETWORK' };
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return { title: 'Sessão expirada', message: 'Faça login novamente.', code: 'AUTH' };
      }
      if (error.message.includes('403')) {
        return { title: 'Acesso negado', message: 'Você não tem permissão para esta ação.', code: 'FORBIDDEN' };
      }
      if (error.message.includes('404')) {
        return { title: 'Não encontrado', message: 'O recurso solicitado não existe.', code: 'NOT_FOUND' };
      }
      if (error.message.includes('429')) {
        return { title: 'Muitas requisições', message: 'Aguarde um momento e tente novamente.', code: 'RATE_LIMIT' };
      }
      if (error.message.includes('500') || error.message.includes('Internal')) {
        return { title: 'Erro interno', message: 'Algo deu errado. Tente novamente mais tarde.', code: 'SERVER' };
      }
    }
    return { title: 'Erro desconhecido', message: 'Ocorreu um erro inesperado.', code: 'UNKNOWN' };
  };

  it('should format network errors', () => {
    expect(formatError(new Error('Failed to fetch')).code).toBe('NETWORK');
  });

  it('should format auth errors', () => {
    expect(formatError(new Error('401 Unauthorized')).code).toBe('AUTH');
  });

  it('should format forbidden errors', () => {
    expect(formatError(new Error('403 Forbidden')).code).toBe('FORBIDDEN');
  });

  it('should format not found', () => {
    expect(formatError(new Error('404')).code).toBe('NOT_FOUND');
  });

  it('should format rate limit', () => {
    expect(formatError(new Error('429')).code).toBe('RATE_LIMIT');
  });

  it('should format server errors', () => {
    expect(formatError(new Error('500 Internal Server Error')).code).toBe('SERVER');
  });

  it('should handle unknown errors', () => {
    expect(formatError('string error').code).toBe('UNKNOWN');
    expect(formatError(null).code).toBe('UNKNOWN');
  });
});

describe('Retry - Exponential Backoff', () => {
  const calculateBackoff = (attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number => {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay;
  };

  it('should calculate exponential delays', () => {
    expect(calculateBackoff(0)).toBe(1000);
    expect(calculateBackoff(1)).toBe(2000);
    expect(calculateBackoff(2)).toBe(4000);
    expect(calculateBackoff(3)).toBe(8000);
  });

  it('should cap at max delay', () => {
    expect(calculateBackoff(10, 1000, 30000)).toBe(30000);
  });
});

describe('Retry - Retryable Error Detection', () => {
  const isRetryable = (statusCode: number): boolean => {
    return [408, 429, 500, 502, 503, 504].includes(statusCode);
  };

  it('should retry server errors', () => {
    expect(isRetryable(500)).toBe(true);
    expect(isRetryable(502)).toBe(true);
    expect(isRetryable(503)).toBe(true);
  });

  it('should retry rate limits', () => {
    expect(isRetryable(429)).toBe(true);
  });

  it('should not retry client errors', () => {
    expect(isRetryable(400)).toBe(false);
    expect(isRetryable(401)).toBe(false);
    expect(isRetryable(403)).toBe(false);
    expect(isRetryable(404)).toBe(false);
  });
});

describe('Graceful Degradation - Fallback Values', () => {
  const withFallback = <T>(fn: () => T, fallback: T): T => {
    try { return fn(); } catch { return fallback; }
  };

  it('should return value on success', () => {
    expect(withFallback(() => JSON.parse('{"a":1}'), {})).toEqual({ a: 1 });
  });

  it('should return fallback on error', () => {
    expect(withFallback(() => JSON.parse('invalid'), {})).toEqual({});
  });
});

describe('Error - Validation Errors', () => {
  type ValidationError = { field: string; message: string };

  const validate = (data: Record<string, any>, rules: Record<string, { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }>): ValidationError[] => {
    const errors: ValidationError[] = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push({ field, message: 'Campo obrigatório' });
        continue;
      }
      if (value && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) errors.push({ field, message: `Mínimo ${rule.minLength} caracteres` });
        if (rule.maxLength && value.length > rule.maxLength) errors.push({ field, message: `Máximo ${rule.maxLength} caracteres` });
        if (rule.pattern && !rule.pattern.test(value)) errors.push({ field, message: 'Formato inválido' });
      }
    }
    return errors;
  };

  it('should validate required fields', () => {
    const errors = validate({}, { name: { required: true }, email: { required: true } });
    expect(errors).toHaveLength(2);
  });

  it('should validate min length', () => {
    const errors = validate({ name: 'Ab' }, { name: { minLength: 3 } });
    expect(errors).toHaveLength(1);
  });

  it('should validate pattern', () => {
    const errors = validate({ email: 'invalid' }, { email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Formato inválido');
  });

  it('should pass valid data', () => {
    const errors = validate(
      { name: 'João', email: 'joao@test.com' },
      { name: { required: true, minLength: 2 }, email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
    );
    expect(errors).toHaveLength(0);
  });
});

describe('Error - Toast Queue Management', () => {
  const deduplicateToasts = (toasts: { id: string; message: string; timestamp: number }[], windowMs: number = 5000): typeof toasts => {
    const seen = new Map<string, number>();
    return toasts.filter(t => {
      const lastSeen = seen.get(t.message);
      if (lastSeen && t.timestamp - lastSeen < windowMs) return false;
      seen.set(t.message, t.timestamp);
      return true;
    });
  };

  it('should deduplicate within window', () => {
    const toasts = [
      { id: '1', message: 'Erro de rede', timestamp: 1000 },
      { id: '2', message: 'Erro de rede', timestamp: 2000 },
      { id: '3', message: 'Sucesso', timestamp: 3000 },
    ];
    expect(deduplicateToasts(toasts)).toHaveLength(2);
  });

  it('should allow after window expires', () => {
    const toasts = [
      { id: '1', message: 'Erro', timestamp: 1000 },
      { id: '2', message: 'Erro', timestamp: 10000 },
    ];
    expect(deduplicateToasts(toasts, 5000)).toHaveLength(2);
  });
});
