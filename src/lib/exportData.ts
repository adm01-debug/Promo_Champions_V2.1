// Data Export Utilities
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  downloadFile(csv, `${filename}.csv`, 'text/csv');
};

export const exportToJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
};

export const exportToPDF = (data: any[], filename: string, columns: string[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(filename, 14, 20);
  
  const tableData = data.map(item => columns.map(col => item[col]));
  
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: 30,
  });
  
  doc.save(`${filename}.pdf`);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportData = (
  data: any[],
  format: ExportFormat,
  filename: string,
  columns?: string[]
) => {
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'pdf':
      exportToPDF(data, filename, columns || Object.keys(data[0] || {}));
      break;
    default:
      throw new Error(`Export format ${format} not supported`);
  }
};
