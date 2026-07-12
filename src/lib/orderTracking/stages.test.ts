import { describe, it, expect } from 'vitest';
import {
  ALL_STAGES,
  OPERATIONAL_STAGES,
  FINANCIAL_STAGES,
  POST_SALE_STAGES,
  TRACKS,
  getStage,
  formatBRL,
  formatDate,
  formatDateTime,
} from './stages';

describe('stages catálogo', () => {
  it('OPERATIONAL_STAGES tem 8 estágios com order 1-8', () => {
    expect(OPERATIONAL_STAGES).toHaveLength(8);
    OPERATIONAL_STAGES.forEach((s, i) => expect(s.order).toBe(i + 1));
  });

  it('FINANCIAL_STAGES tem 4 estágios', () => {
    expect(FINANCIAL_STAGES).toHaveLength(4);
    FINANCIAL_STAGES.forEach((s) => expect(s.track).toBe('financial'));
  });

  it('POST_SALE_STAGES tem 3 estágios', () => {
    expect(POST_SALE_STAGES).toHaveLength(3);
  });

  it('ALL_STAGES concatena os 3 tracks', () => {
    expect(ALL_STAGES).toHaveLength(8 + 4 + 3);
  });

  it('TRACKS expõe accent semântico', () => {
    const accents = TRACKS.map((t) => t.accent);
    expect(accents).toContain('primary');
    expect(accents).toContain('success');
    expect(accents).toContain('warning');
  });
});

describe('getStage', () => {
  it('retorna estágio por key', () => {
    const s = getStage('compras');
    expect(s?.label).toBe('Compras');
    expect(s?.track).toBe('operational');
  });

  it('retorna undefined para key inexistente', () => {
    // @ts-expect-error testando fallback
    expect(getStage('inexistente')).toBeUndefined();
  });
});

describe('formatBRL', () => {
  it('formata número positivo', () => {
    expect(formatBRL(1234.56)).toMatch(/R\$\s?1\.234,56/);
  });

  it('formata 0 como R$ 0,00', () => {
    expect(formatBRL(0)).toMatch(/R\$\s?0,00/);
  });
});

describe('formatDate / formatDateTime', () => {
  it('formatDate devolve dd/mm/yyyy', () => {
    expect(formatDate('2026-04-15T12:00:00Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
  });

  it('formatDate devolve — quando null/undefined/empty', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('formatDateTime inclui hora', () => {
    const out = formatDateTime('2026-04-15T15:30:00');
    expect(out).toMatch(/^\d{2}\/\d{2}\/2026,?\s\d{2}:\d{2}$/);
  });

  it('formatDateTime devolve — quando vazio', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});
