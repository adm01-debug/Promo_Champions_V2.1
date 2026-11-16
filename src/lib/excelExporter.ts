import { sanitizeCsvCell } from '@/utils/csvExport';

export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Dados'
) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20,
    }));
    // Neutralize formula injection (CWE-1236): ExcelJS treats a string cell
    // starting with = + - @ as a live formula, so sanitize string values.
    data.forEach(row => {
      const safeRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        safeRow[key] = typeof value === 'string' ? sanitizeCsvCell(value) : value;
      }
      worksheet.addRow(safeRow);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
