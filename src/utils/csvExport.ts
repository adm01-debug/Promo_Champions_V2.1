/**
 * CSV Export Utilities
 */

interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Build CSV content
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      const value = typeof col.accessor === 'function' 
        ? col.accessor(item) 
        : (item as Record<string, unknown>)[col.accessor as string];
      
      // Handle null/undefined
      if (value === null || value === undefined) return '""';
      
      // Handle numbers
      if (typeof value === 'number') return value.toString();
      
      // Handle strings - escape quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(value: number | null): string {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Format percentage for export
 */
export function formatPercentForExport(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
}
