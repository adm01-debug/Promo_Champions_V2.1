import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportData = {
  toCSV: (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return \`"\${value}"\`;
          }
          return value;
        }).join(',')
      ),
    ].join('
');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = \`\${filename}.csv\`;
    link.click();
  },
  
  toExcel: (data: any[], filename: string) => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    writeFile(workbook, \`\${filename}.xlsx\`);
  },
  
  toPDF: (data: any[], filename: string, title = 'Relatório') => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]));
    
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 30,
    });
    
    doc.save(\`\${filename}.pdf\`);
  },
};
