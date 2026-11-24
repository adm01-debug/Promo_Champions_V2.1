import { describe, expect, it } from 'vitest';
import {
  allowConsoleError,
  allowConsoleWarn,
  formatConsoleArgs,
  installConsoleGuard,
  resetConsoleGuard,
  unexpectedConsoleOutput,
} from './consoleGuard';

describe('consoleGuard', () => {
  it('formata erro, string e objeto numa linha', () => {
    expect(formatConsoleArgs(['falhou', new Error('boom')])).toBe('falhou Error: boom');
    expect(formatConsoleArgs([{ message: 'recusado' }])).toBe('{"message":"recusado"}');
    expect(formatConsoleArgs([null, undefined])).toBe('null undefined');
  });

  it('trunca mensagens longas', () => {
    const long = formatConsoleArgs(['x'.repeat(600)]);
    expect(long).toHaveLength(501);
    expect(long.endsWith('…')).toBe(true);
  });

  it('aponta o que não foi declarado e silencia o que foi', () => {
    installConsoleGuard();
    allowConsoleError('mensagem permitida');

    console.error('mensagem permitida', { detalhe: 1 });
    console.warn('aviso solto');

    expect(unexpectedConsoleOutput()).toEqual(['console.warn: aviso solto']);

    allowConsoleWarn('aviso solto');
    expect(unexpectedConsoleOutput()).toEqual([]);

    resetConsoleGuard();
  });

  it('aceita expressão regular como declaração', () => {
    installConsoleGuard();
    allowConsoleError(/^Query data cannot be undefined/);

    console.error('Query data cannot be undefined. Affected query key: ["cadences"]');

    expect(unexpectedConsoleOutput()).toEqual([]);
    resetConsoleGuard();
  });

  it('volta ao estado limpo depois do reset', () => {
    installConsoleGuard();
    console.error('antes do reset');
    expect(unexpectedConsoleOutput()).toHaveLength(1);

    resetConsoleGuard();
    expect(unexpectedConsoleOutput()).toEqual([]);
  });
});
