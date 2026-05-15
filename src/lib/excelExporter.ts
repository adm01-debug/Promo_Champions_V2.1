export async function exportToExcel<T extends Record<string, string | number | boolean | null | undefined>>(data: T[], filename: string, sheetName: string = 'Dados') {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20,
    }));
    data.forEach(row => worksheet.addRow(row));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}