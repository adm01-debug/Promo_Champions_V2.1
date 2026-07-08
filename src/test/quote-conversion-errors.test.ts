import { describe, it, expect } from 'vitest';
import { parseConvertQuoteError } from '@/hooks/useQuotes';

describe('parseConvertQuoteError', () => {
  it.each([
    ['[NOT_AUTHENTICATED] Sessão inválida', 'NOT_AUTHENTICATED'],
    ['[QUOTE_NOT_FOUND] Orçamento não encontrado', 'QUOTE_NOT_FOUND'],
    ['[FORBIDDEN] Sem permissão', 'FORBIDDEN'],
    ['[INVALID_STATUS] Status: draft', 'INVALID_STATUS'],
    ['[INVALID_TOTAL] Valor negativo', 'INVALID_TOTAL'],
    ['[TOTAL_MISMATCH] 100 vs 90', 'TOTAL_MISMATCH'],
  ] as const)('extrai código de "%s"', (input, expected) => {
    expect(parseConvertQuoteError(input)).toBe(expected);
  });

  it('devolve UNKNOWN para mensagens sem prefixo', () => {
    expect(parseConvertQuoteError('random pg error')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('')).toBe('UNKNOWN');
  });

  it('devolve UNKNOWN para códigos desconhecidos', () => {
    expect(parseConvertQuoteError('[NEW_CODE] foo')).toBe('UNKNOWN');
  });
});
