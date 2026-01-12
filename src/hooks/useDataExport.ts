import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any) => string;
}

interface UseDataExportOptions {
  filename?: string;
  title?: string;
  columns?: ExportColumn[];
}

/**
 * useDataExport - Hook for exporting data to various formats
 */
export function useDataExport<T extends Record<string, any>>(
  options: UseDataExportOptions = {}
) {
  const { filename = 'export', title = 'Relatório' } = options;
  const [isExporting, setIsExporting] = useState(false);

  // Format data according to columns
  const formatData = useCallback((
    data: T[],
    columns?: ExportColumn[]
  ): Record<string, any>[] => {
    if (!columns) return data;

    return data.map(item => {
      const formatted: Record<string, any> = {};
      columns.forEach(col => {
        const value = item[col.key];
        formatted[col.header] = col.format ? col.format(value) : value;
      });
      return formatted;
    });
  }, []);

  // Export to CSV
  const exportToCSV = useCallback((data: T[], columns?: ExportColumn[]) => {
    const formattedData = formatData(data, columns);
    const csv = Papa.unparse(formattedData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `${filename}.csv`);
  }, [filename, formatData]);

  // Export to Excel
  const exportToExcel = useCallback((data: T[], columns?: ExportColumn[]) => {
    const formattedData = formatData(data, columns);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Set column widths
    if (columns) {
      const colWidths = columns.map(col => ({ wch: col.width || 15 }));
      worksheet['!cols'] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }, [filename, formatData]);

  // Export to PDF
  const exportToPDF = useCallback((
    data: T[],
    columns?: ExportColumn[],
    pdfOptions?: {
      orientation?: 'portrait' | 'landscape';
      pageSize?: 'a4' | 'letter';
    }
  ) => {
    const { orientation = 'portrait', pageSize = 'a4' } = pdfOptions || {};
    
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

    // Prepare table data
    const headers = columns ? columns.map(c => c.header) : Object.keys(data[0] || {});
    const body = data.map(item => {
      if (columns) {
        return columns.map(col => {
          const value = item[col.key];
          return col.format ? col.format(value) : String(value ?? '');
        });
      }
      return Object.values(item).map(v => String(v ?? ''));
    });

    // Add table
    autoTable(doc, {
      head: [headers],
      body,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    doc.save(`${filename}.pdf`);
  }, [filename, title]);

  // Export to JSON
  const exportToJSON = useCallback((data: T[]) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
  }, [filename]);

  // Main export function
  const exportData = useCallback(async (
    format: ExportFormat,
    data: T[],
    columns?: ExportColumn[]
  ) => {
    setIsExporting(true);
    
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, columns);
          break;
        case 'xlsx':
          exportToExcel(data, columns);
          break;
        case 'pdf':
          exportToPDF(data, columns);
          break;
        case 'json':
          exportToJSON(data);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  }, [exportToCSV, exportToExcel, exportToPDF, exportToJSON]);

  return {
    exportData,
    exportToCSV,
    exportToExcel,
    exportToPDF,
    exportToJSON,
    isExporting,
  };
}

// Helper to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
