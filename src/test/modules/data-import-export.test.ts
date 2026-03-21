/**
 * Data Import & Export Pipeline Tests
 * Tests: CSV parsing, data validation, transformation, conflict detection
 */
import { describe, it, expect } from 'vitest';

describe('CSV Import - Parsing', () => {
  const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === delimiter && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += char;
    }
    result.push(current.trim());
    return result;
  };

  it('should parse simple CSV', () => {
    expect(parseCSVLine('João,30,São Paulo')).toEqual(['João', '30', 'São Paulo']);
  });

  it('should handle quoted fields', () => {
    expect(parseCSVLine('"Silva, João",30,"São Paulo"')).toEqual(['Silva, João', '30', 'São Paulo']);
  });

  it('should handle semicolon delimiter', () => {
    expect(parseCSVLine('João;30;SP', ';')).toEqual(['João', '30', 'SP']);
  });

  it('should handle empty fields', () => {
    expect(parseCSVLine('João,,SP')).toEqual(['João', '', 'SP']);
  });
});

describe('CSV Import - Column Mapping', () => {
  const autoMapColumns = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string[]> = {
      client_name: ['nome', 'cliente', 'name', 'client', 'razão social'],
      email: ['email', 'e-mail', 'correio'],
      phone: ['telefone', 'phone', 'tel', 'celular'],
      amount: ['valor', 'amount', 'preço', 'price', 'total'],
      company: ['empresa', 'company', 'razão social', 'cnpj'],
    };
    const result: Record<string, string> = {};
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      for (const [field, aliases] of Object.entries(mapping)) {
        if (aliases.includes(normalized)) { result[header] = field; break; }
      }
    });
    return result;
  };

  it('should auto-map PT-BR headers', () => {
    const mapped = autoMapColumns(['Nome', 'Email', 'Telefone', 'Valor']);
    expect(mapped['Nome']).toBe('client_name');
    expect(mapped['Email']).toBe('email');
    expect(mapped['Valor']).toBe('amount');
  });

  it('should auto-map EN headers', () => {
    const mapped = autoMapColumns(['Name', 'Phone', 'Amount']);
    expect(mapped['Name']).toBe('client_name');
    expect(mapped['Phone']).toBe('phone');
  });

  it('should skip unmapped columns', () => {
    const mapped = autoMapColumns(['Nome', 'Observações']);
    expect(Object.keys(mapped)).toHaveLength(1);
  });
});

describe('Data Import - Row Validation', () => {
  type ValidationRule = { field: string; required?: boolean; type?: 'string' | 'number' | 'email'; min?: number };

  const validateRow = (row: Record<string, any>, rules: ValidationRule[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    for (const rule of rules) {
      const value = row[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field}: campo obrigatório`);
        continue;
      }
      if (value !== undefined && value !== '') {
        if (rule.type === 'number' && isNaN(Number(value))) errors.push(`${rule.field}: deve ser número`);
        if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors.push(`${rule.field}: email inválido`);
        if (rule.min !== undefined && Number(value) < rule.min) errors.push(`${rule.field}: valor mínimo ${rule.min}`);
      }
    }
    return { valid: errors.length === 0, errors };
  };

  it('should validate valid row', () => {
    const result = validateRow(
      { name: 'João', email: 'joao@test.com', amount: '5000' },
      [{ field: 'name', required: true }, { field: 'email', type: 'email' }, { field: 'amount', type: 'number', min: 0 }]
    );
    expect(result.valid).toBe(true);
  });

  it('should catch missing required', () => {
    const result = validateRow({ name: '' }, [{ field: 'name', required: true }]);
    expect(result.valid).toBe(false);
  });

  it('should catch invalid email', () => {
    const result = validateRow({ email: 'not-email' }, [{ field: 'email', type: 'email' }]);
    expect(result.valid).toBe(false);
  });

  it('should catch invalid number', () => {
    const result = validateRow({ amount: 'abc' }, [{ field: 'amount', type: 'number' }]);
    expect(result.valid).toBe(false);
  });
});

describe('Data Import - Duplicate Detection', () => {
  const findDuplicates = <T extends Record<string, any>>(items: T[], keys: (keyof T)[]): { index: number; duplicateOf: number }[] => {
    const duplicates: { index: number; duplicateOf: number }[] = [];
    const seen = new Map<string, number>();
    items.forEach((item, idx) => {
      const key = keys.map(k => String(item[k]).toLowerCase().trim()).join('|');
      const firstIdx = seen.get(key);
      if (firstIdx !== undefined) {
        duplicates.push({ index: idx, duplicateOf: firstIdx });
      } else {
        seen.set(key, idx);
      }
    });
    return duplicates;
  };

  it('should find duplicates by name+email', () => {
    const items = [
      { name: 'João', email: 'joao@test.com' },
      { name: 'Maria', email: 'maria@test.com' },
      { name: 'joão', email: 'joao@test.com' },
    ];
    const dups = findDuplicates(items, ['name', 'email']);
    expect(dups).toHaveLength(1);
    expect(dups[0].index).toBe(2);
    expect(dups[0].duplicateOf).toBe(0);
  });

  it('should handle no duplicates', () => {
    expect(findDuplicates([{ name: 'A' }, { name: 'B' }], ['name'])).toHaveLength(0);
  });
});

describe('Export - Data Sanitization', () => {
  const sanitizeForExport = (value: string): string => {
    // Prevent CSV injection
    if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
    return value;
  };

  it('should prefix formula chars', () => {
    expect(sanitizeForExport('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(sanitizeForExport('+cmd')).toBe("'+cmd");
    expect(sanitizeForExport('-calc')).toBe("'-calc");
    expect(sanitizeForExport('@import')).toBe("'@import");
  });

  it('should not modify safe strings', () => {
    expect(sanitizeForExport('João Silva')).toBe('João Silva');
    expect(sanitizeForExport('R$ 5.000')).toBe('R$ 5.000');
  });
});

describe('Import - Progress Tracking', () => {
  const calculateImportProgress = (processed: number, total: number, errors: number): { pct: number; successRate: number; eta: string } => {
    const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
    const successRate = processed > 0 ? Math.round(((processed - errors) / processed) * 100) : 100;
    const remaining = total - processed;
    const eta = remaining > 100 ? `~${Math.ceil(remaining / 100)}s` : '<1s';
    return { pct, successRate, eta };
  };

  it('should track progress', () => {
    const result = calculateImportProgress(500, 1000, 5);
    expect(result.pct).toBe(50);
    expect(result.successRate).toBe(99);
  });

  it('should handle completion', () => {
    expect(calculateImportProgress(100, 100, 0).pct).toBe(100);
  });
});
