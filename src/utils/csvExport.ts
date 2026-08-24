import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Neutralizes CSV formula injection (CWE-1236): a cell whose first character is
 * one of = + - @ TAB CR is treated as a formula by Excel/Sheets. Prefix it with a
 * single quote so spreadsheet apps render it as plain text.
 */
export function sanitizeCsvCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  if (!data || data.length === 0) {
    return;
  }

  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row =>
      keys
        .map(key => {
          const value = row[key];
          if (value === null || value === undefined) return '""';
          const stringValue = sanitizeCsvCell(String(value));
          // Escape quotes and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return String(date);
  }
}

/**
 * Format percentage for export
 */
export function formatPercentForExport(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format number for export
 */
export function formatNumberForExport(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
