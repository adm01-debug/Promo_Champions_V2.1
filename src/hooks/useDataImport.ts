import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  successRows: number;
}

interface UseDataImportOptions<T> {
  validateRow?: (row: Record<string, any>, index: number) => { valid: boolean; error?: string };
  transformRow?: (row: Record<string, any>) => T;
  requiredColumns?: string[];
  maxRows?: number;
}

/**
 * useDataImport - Hook for importing data from CSV/Excel files
 */
export function useDataImport<T extends Record<string, any>>(
  options: UseDataImportOptions<T> = {}
) {
  const { 
    validateRow, 
    transformRow, 
    requiredColumns = [],
    maxRows = 10000 
  } = options;
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Parse CSV file
  const parseCSV = useCallback((file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as Record<string, any>[]);
        },
        error: (error) => {
          reject(new Error(`Erro ao ler CSV: ${error.message}`));
        },
      });
    });
  }, []);

  // Parse Excel file
  const parseExcel = useCallback((file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as Record<string, any>[]);
        } catch (error) {
          reject(new Error('Erro ao ler arquivo Excel'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Process imported data
  const processData = useCallback(async (
    rawData: Record<string, any>[]
  ): Promise<ImportResult<T>> => {
    const result: ImportResult<T> = {
      data: [],
      errors: [],
      warnings: [],
      totalRows: rawData.length,
      successRows: 0,
    };

    // Check max rows
    if (rawData.length > maxRows) {
      result.warnings.push(`Arquivo contém ${rawData.length} linhas. Apenas as primeiras ${maxRows} serão processadas.`);
      rawData = rawData.slice(0, maxRows);
    }

    // Check required columns
    if (requiredColumns.length > 0 && rawData.length > 0) {
      const firstRow = rawData[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        result.errors.push(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
        return result;
      }
    }

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      setProgress(Math.round((i / rawData.length) * 100));

      // Validate row
      if (validateRow) {
        const validation = validateRow(row, i);
        if (!validation.valid) {
          result.errors.push(`Linha ${i + 2}: ${validation.error}`);
          continue;
        }
      }

      // Transform row
      const transformedRow = transformRow ? transformRow(row) : row as unknown as T;
      result.data.push(transformedRow);
      result.successRows++;
    }

    return result;
  }, [maxRows, requiredColumns, validateRow, transformRow]);

  // Main import function
  const importFile = useCallback(async (file: File): Promise<ImportResult<T>> => {
    setIsImporting(true);
    setProgress(0);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rawData: Record<string, any>[];

      if (extension === 'csv') {
        rawData = await parseCSV(file);
      } else if (extension === 'xlsx' || extension === 'xls') {
        rawData = await parseExcel(file);
      } else {
        throw new Error('Formato de arquivo não suportado. Use CSV ou Excel.');
      }

      const result = await processData(rawData);
      return result;
    } finally {
      setIsImporting(false);
      setProgress(100);
    }
  }, [parseCSV, parseExcel, processData]);

  return {
    importFile,
    isImporting,
    progress,
  };
}
