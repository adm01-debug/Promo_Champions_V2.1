import type { jsPDF } from 'jspdf';
import type { UserOptions } from 'jspdf-autotable';

export type ExportDataValue = string | number | boolean | null | undefined;

export async function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns?: { header: string; dataKey: string }[]
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF() as jsPDF;
  
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  const cols = columns || Object.keys(data[0] || {}).map(k => ({ header: k, dataKey: k }));
  
  const options: UserOptions = {
    head: [cols.map(c => c.header)],
    body: data.map(row => cols.map(c => row[c.dataKey] as any)),
    startY: 30,
  };
  
  autoTable(doc, options);
  
  doc.save(`${filename}.pdf`);
}