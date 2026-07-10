import { describe, it, expect } from 'vitest';
import {
  parseConvertQuoteError,
  CONVERT_QUOTE_ERROR_MESSAGES,
  type ConvertQuoteErrorCode,
} from '@/hooks/quoteErrorMessages';

describe('parseConvertQuoteError (módulo standalone)', () => {
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

  it.each(codes.filter((c) => c !== 'UNKNOWN'))(
    'extrai código %s do prefixo padronizado',
    (code) => {
      expect(parseConvertQuoteError(`[${code}] detalhe qualquer`)).toBe(code);
    },
  );

  it('normaliza espaços em branco antes do prefixo', () => {
    expect(parseConvertQuoteError('   [FORBIDDEN] com leading spaces')).toBe('FORBIDDEN');
    expect(parseConvertQuoteError('\n\t[TOTAL_MISMATCH] multi-linha')).toBe('TOTAL_MISMATCH');
  });

  it('devolve UNKNOWN para prefixo inválido ou desconhecido', () => {
    expect(parseConvertQuoteError('[FOO] código novo')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('[not_uppercase] minúsculo')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('sem prefixo nenhum')).toBe('UNKNOWN');
    expect(parseConvertQuoteError('')).toBe('UNKNOWN');
  });

  it('todos os códigos têm mensagem PT-BR não-vazia mapeada', () => {
    for (const code of codes) {
      const msg = CONVERT_QUOTE_ERROR_MESSAGES[code];
      expect(msg).toBeTruthy();
      expect(msg.length).toBeGreaterThan(10);
    }
  });

  it('mensagens críticas contêm keywords esperadas', () => {
    expect(CONVERT_QUOTE_ERROR_MESSAGES.EMPTY_ITEMS).toMatch(/sem itens/i);
    expect(CONVERT_QUOTE_ERROR_MESSAGES.FORBIDDEN).toMatch(/permiss/i);
    expect(CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH).toMatch(/total/i);
    expect(CONVERT_QUOTE_ERROR_MESSAGES.NOT_AUTHENTICATED).toMatch(/(login|sess[aã]o)/i);
  });
});
