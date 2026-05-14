export async function exportToCSV<T extends Record<string, string | number | boolean | null | undefined>>(data: T[], filename: string) {
  const Papa = (await import('papaparse')).default;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}