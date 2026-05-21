import { sanitizeCsvCell } from '@/utils/csvExport';

export async function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  const Papa = (await import('papaparse')).default;
  const safeData = data.map(row => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] = typeof value === 'string' ? sanitizeCsvCell(value) : value;
    }
    return out;
  });
  const csv = Papa.unparse(safeData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}
