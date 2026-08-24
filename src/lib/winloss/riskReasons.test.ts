import { describe, it, expect } from 'vitest';
import {
  getReasonKindMeta,
  inferReasonCode,
  isRiskReasonCode,
  RISK_REASON_CODES,
  RISK_REASON_LABELS,
} from './riskReasons';

describe('getReasonKindMeta', () => {
  it('todos os códigos retornam meta com label + variant', () => {
    RISK_REASON_CODES.forEach((code) => {
      const meta = getReasonKindMeta(code);
      expect(meta.label).toBe(RISK_REASON_LABELS[code]);
      expect(meta.icon).toBeDefined();
      expect(meta.variant).toBeDefined();
    });
  });

  it('STAGNATION_HIGH tem contribMax=50 e source=stagnation', () => {
    const m = getReasonKindMeta('STAGNATION_HIGH');
    expect(m.contribMax).toBe(50);
    expect(m.source).toBe('stagnation');
  });

  it('COMPETITOR_PRESSURE tem source=competitor e variant=destructive', () => {
    const m = getReasonKindMeta('COMPETITOR_PRESSURE');
    expect(m.source).toBe('competitor');
    expect(m.variant).toBe('destructive');
    expect(m.contribMax).toBeNull();
  });
});

describe('inferReasonCode', () => {
  it('classifica estagnação severa quando menciona "média de loss"', () => {
    expect(inferReasonCode('45 dias sem atualização (média de loss = 30)')).toBe('STAGNATION_HIGH');
  });

  it('classifica estagnação leve', () => {
    expect(inferReasonCode('20 dias sem atualização')).toBe('STAGNATION_LOW');
  });

  it('detecta ticket alinhado', () => {
    expect(inferReasonCode('Ticket alinhado com perdas históricas')).toBe('AMOUNT_ALIGNED');
  });

  it('detecta estágio travado', () => {
    expect(inferReasonCode('Estágio Proposal travado há 30 dias')).toBe('STAGE_STUCK');
  });

  it('detecta pressão competitiva', () => {
    expect(inferReasonCode('Pressão competitiva de concorrente X')).toBe('COMPETITOR_PRESSURE');
  });

  it('fallback CROSSED_SIGNALS para mensagem desconhecida', () => {
    expect(inferReasonCode('mensagem qualquer')).toBe('CROSSED_SIGNALS');
    expect(inferReasonCode('')).toBe('CROSSED_SIGNALS');
  });

  it('trata null/undefined via fallback ?? "" (linha 92)', () => {
    expect(inferReasonCode(null as unknown as string)).toBe('CROSSED_SIGNALS');
    expect(inferReasonCode(undefined as unknown as string)).toBe('CROSSED_SIGNALS');
  });
});

describe('isRiskReasonCode', () => {
  it('true para códigos válidos', () => {
    RISK_REASON_CODES.forEach((c) => expect(isRiskReasonCode(c)).toBe(true));
  });

  it('false para valores inválidos', () => {
    expect(isRiskReasonCode('bogus')).toBe(false);
    expect(isRiskReasonCode(null)).toBe(false);
    expect(isRiskReasonCode(42)).toBe(false);
    expect(isRiskReasonCode(undefined)).toBe(false);
  });
});
