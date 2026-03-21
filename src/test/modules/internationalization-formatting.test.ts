/**
 * Internationalization & Formatting Tests
 * Tests: currency, dates, numbers, relative time, pluralization
 */
import { describe, it, expect } from 'vitest';

describe('Currency - BRL Formatting', () => {
  const formatBRL = (value: number): string => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCompactBRL = (value: number): string => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
    return formatBRL(value);
  };

  it('should format standard values', () => {
    expect(formatBRL(1500.50)).toContain('1.500,50');
  });

  it('should format zero', () => {
    expect(formatBRL(0)).toContain('0,00');
  });

  it('should format compact millions', () => {
    expect(formatCompactBRL(2500000)).toBe('R$ 2.5M');
  });

  it('should format compact thousands', () => {
    expect(formatCompactBRL(15000)).toBe('R$ 15.0K');
  });

  it('should not compact small values', () => {
    expect(formatCompactBRL(500)).toContain('500');
  });
});

describe('Date - PT-BR Formatting', () => {
  const formatDateBR = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatDateTimeBR = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${formatDateBR(dateStr)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  it('should format date as DD/MM/YYYY', () => {
    expect(formatDateBR('2024-03-15')).toBe('15/03/2024');
  });

  it('should format date with time', () => {
    const result = formatDateTimeBR('2024-03-15T14:30:00');
    expect(result).toContain('15/03/2024');
    expect(result).toContain('14:30');
  });

  it('should pad single digits', () => {
    expect(formatDateBR('2024-01-05')).toBe('05/01/2024');
  });
});

describe('Relative Time', () => {
  const getRelativeTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d atrás`;
    const months = Math.floor(days / 30);
    return `${months} ${months > 1 ? 'meses' : 'mês'} atrás`;
  };

  it('should show agora for recent', () => {
    expect(getRelativeTime(new Date().toISOString())).toBe('agora');
  });

  it('should show minutes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(getRelativeTime(fiveMinAgo)).toBe('5min atrás');
  });

  it('should show hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(getRelativeTime(threeHoursAgo)).toBe('3h atrás');
  });

  it('should show days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(getRelativeTime(twoDaysAgo)).toBe('2d atrás');
  });

  it('should pluralize months', () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString();
    expect(getRelativeTime(threeMonthsAgo)).toContain('meses');
  });
});

describe('Number Formatting', () => {
  const formatNumber = (value: number, decimals: number = 0): string => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatPercent = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  };

  it('should format integers', () => {
    expect(formatNumber(1500000)).toContain('1.500.000');
  });

  it('should format with decimals', () => {
    expect(formatNumber(1234.567, 2)).toContain('1.234,57');
  });

  it('should format percentages', () => {
    expect(formatPercent(85.5)).toBe('85.5%');
    expect(formatPercent(100, 0)).toBe('100%');
  });
});

describe('Pluralization - PT-BR', () => {
  const pluralize = (count: number, singular: string, plural: string): string => {
    return `${count} ${count === 1 ? singular : plural}`;
  };

  it('should use singular for 1', () => {
    expect(pluralize(1, 'venda', 'vendas')).toBe('1 venda');
    expect(pluralize(1, 'meta', 'metas')).toBe('1 meta');
  });

  it('should use plural for 0', () => {
    expect(pluralize(0, 'venda', 'vendas')).toBe('0 vendas');
  });

  it('should use plural for > 1', () => {
    expect(pluralize(5, 'cliente', 'clientes')).toBe('5 clientes');
  });
});

describe('Phone Formatting - BR', () => {
  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return phone;
  };

  it('should format mobile (11 digits)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('should format landline (10 digits)', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('should return as-is for invalid', () => {
    expect(formatPhone('123')).toBe('123');
  });

  it('should strip non-digits first', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });
});
