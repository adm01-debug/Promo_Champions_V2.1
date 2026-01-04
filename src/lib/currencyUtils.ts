export const currency = {
  format: (value: number, locale = 'pt-BR', currency = 'BRL') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  },
  
  parse: (value: string): number => {
    return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'));
  },
  
  add: (a: number, b: number): number => {
    return Math.round((a + b) * 100) / 100;
  },
  
  subtract: (a: number, b: number): number => {
    return Math.round((a - b) * 100) / 100;
  },
  
  multiply: (a: number, b: number): number => {
    return Math.round(a * b * 100) / 100;
  },
  
  divide: (a: number, b: number): number => {
    if (b === 0) throw new Error('Division by zero');
    return Math.round((a / b) * 100) / 100;
  },
  
  percentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 10000) / 100;
  },
};
