import { describe, it, expect } from 'vitest';
import {
  parseConvertQuoteError,
  CONVERT_QUOTE_ERROR_MESSAGES,
  type ConvertQuoteErrorCode,
} from '@/hooks/quoteErrorMessages';

describe('parseConvertQuoteError', () => {
  it.each([
    ['[NOT_AUTHENTICATED] Sessão inválida', 'NOT_AUTHENTICATED'],
    ['[QUOTE_NOT_FOUND] Orçamento não encontrado', 'QUOTE_NOT_FOUND'],
    ['[FORBIDDEN] Sem permissão', 'FORBIDDEN'],
    ['[INVALID_STATUS] Status: draft', 'INVALID_STATUS'],
    ['[INVALID_TOTAL] Valor negativo', 'INVALID_TOTAL'],
    ['[EMPTY_ITEMS] Orçamento sem itens', 'EMPTY_ITEMS'],
    ['[TOTAL_MISMATCH] 100 vs 90', 'TOTAL_MISMATCH'],
  ] as const)('extrai código de "%s"', (input, expected) => {
    expect(parseConvertQuoteError(input)).toBe(expected);
  });

  it('devolve UNKNOWN para mensagens sem prefixo, vazias ou desconhecidas', () => {
    expect(parseConvertQuoteError('random pg error')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('[NEW_CODE] foo')).toBe('UNKNOWN');
  });

  it('tolera espaços em branco antes do prefixo', () => {
    expect(parseConvertQuoteError('   [FORBIDDEN] leading spaces')).toBe('FORBIDDEN');
  });
});

describe('CONVERT_QUOTE_ERROR_MESSAGES (mensagens PT-BR expostas ao usuário)', () => {
  const codes: ConvertQuoteErrorCode[] = [
    'NOT_AUTHENTICATED',
    'QUOTE_NOT_FOUND',
    'FORBIDDEN',
    'INVALID_STATUS',
    'INVALID_TOTAL',
    'EMPTY_ITEMS',
    'TOTAL_MISMATCH',
    'UNKNOWN',
  ];

  it('cobre 100% dos códigos com mensagem não-vazia', () => {
    for (const code of codes) {
      expect(CONVERT_QUOTE_ERROR_MESSAGES[code]).toBeTruthy();
      expect(CONVERT_QUOTE_ERROR_MESSAGES[code].length).toBeGreaterThan(5);
    }
  });

  it('EMPTY_ITEMS explica o motivo em PT-BR', () => {
    expect(CONVERT_QUOTE_ERROR_MESSAGES.EMPTY_ITEMS).toMatch(/sem itens/i);
  });

  it('FORBIDDEN cita falta de permissão', () => {
    expect(CONVERT_QUOTE_ERROR_MESSAGES.FORBIDDEN).toMatch(/permiss/i);
  });
});

/**
 * Simulação da lógica de tolerância (±R$ 0,02) aplicada na RPC
 * `fn_convert_quote_to_sale`, para garantir que arredondamento de
 * centavos não dispare TOTAL_MISMATCH em cenários legítimos.
 */
function totalMismatches(total: number, itemsSum: number, tolerance = 0.02): boolean {
  return Math.abs(itemsSum - total) > tolerance;
}

describe('Tolerância de arredondamento de centavos (paridade com a RPC)', () => {
  it('aceita diferença exata de R$ 0,02', () => {
    expect(totalMismatches(100.0, 100.02)).toBe(false);
    expect(totalMismatches(100.02, 100.0)).toBe(false);
  });

  it('aceita diferença menor que R$ 0,02', () => {
    expect(totalMismatches(100.0, 100.01)).toBe(false);
    expect(totalMismatches(100.0, 99.99)).toBe(false);
  });

  it('rejeita diferença acima de R$ 0,02', () => {
    expect(totalMismatches(100.0, 100.03)).toBe(true);
    expect(totalMismatches(100.0, 99.97)).toBe(true);
  });

  it('lida com soma fracionária típica (3 × 33.33 vs 100.00)', () => {
    // 33.33 * 3 = 99.99 → diferença 0.01 → aceito
    const sum = Number((33.33 * 3).toFixed(2));
    expect(totalMismatches(100.0, sum)).toBe(false);
  });

  it('lida com soma fracionária (3 × 33.34 vs 100.00)', () => {
    // 33.34 * 3 = 100.02 → diferença 0.02 → aceito (limite)
    const sum = Number((33.34 * 3).toFixed(2));
    expect(totalMismatches(100.0, sum)).toBe(false);
  });

  it('rejeita quando itens divergem por R$ 0,05', () => {
    expect(totalMismatches(250.0, 250.05)).toBe(true);
  });
});
