import { describe, it, expect, vi } from 'vitest';
import { generateFuzzData, runFuzzTest } from './fuzzing';

describe('generateFuzzData', () => {
  it('gera 10 payloads de string incluindo XSS e SQLi', () => {
    const data = generateFuzzData('string');
    expect(data).toHaveLength(10);
    expect(data).toContain('<script>alert("xss")</script>');
    expect(data).toContain("'; DROP TABLE users; --");
    expect(data).toContain('👋🌍🚀');
  });

  it('gera 10 payloads numéricos incluindo Infinity/NaN', () => {
    const data = generateFuzzData('number') as number[];
    expect(data).toHaveLength(10);
    expect(data).toContain(Infinity);
    expect(data).toContain(-Infinity);
    expect(data.some((n) => Number.isNaN(n))).toBe(true);
  });

  it('gera 10 emails inválidos', () => {
    const data = generateFuzzData('email');
    expect(data).toHaveLength(10);
    expect(data).toContain('plainaddress');
    expect(data).toContain('あいうえお@example.com');
  });

  it('gera 5 payloads de objeto com prototype pollution', () => {
    const data = generateFuzzData('object') as unknown[];
    expect(data).toHaveLength(5);
    // deep-nested + prototype
    expect(data.some((o) => o && typeof o === 'object' && 'constructor' in (o as object))).toBe(true);
  });

  it('retorna [] para tipo desconhecido', () => {
    // @ts-expect-error testando fallback
    expect(generateFuzzData('bogus')).toEqual([]);
  });
});

describe('runFuzzTest', () => {
  it('captura sucesso e falha por payload', async () => {
    const fn = vi.fn(async (s: string) => {
      if (s.length > 100) throw new Error('too long');
      return s.length;
    });
    const results = await runFuzzTest(fn, 'string');
    expect(results).toHaveLength(10);
    expect(results.filter((r) => r.status === 'passed').length).toBeGreaterThan(0);
    expect(results.filter((r) => r.status === 'failed').length).toBeGreaterThan(0);
    const failed = results.find((r) => r.status === 'failed');
    expect(failed?.error).toBe('too long');
  });

  it('funciona com função síncrona', async () => {
    const results = await runFuzzTest((n: number) => n * 2, 'number');
    expect(results.every((r) => r.status === 'passed')).toBe(true);
  });
});
