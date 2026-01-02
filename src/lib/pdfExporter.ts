import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns?: { header: string; dataKey: string }[]
) {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  const cols = columns || Object.keys(data[0] || {}).map(k => ({ header: k, dataKey: k }));
  
  autoTable(doc, {
    head: [cols.map(c => c.header)],
    body: data.map(row => cols.map(c => row[c.dataKey])),
    startY: 30,
  });
  
  doc.save(`${filename}.pdf`);
}
