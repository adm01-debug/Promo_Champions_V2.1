// Data Import Utilities
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ImportFormat = 'csv' | 'xlsx' | 'json';

export interface ImportResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
}

export const importFromCSV = async <T>(file: File): Promise<ImportResult<T>> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve({
          data: results.data as T[],
          errors: results.errors.map(e => e.message),
          warnings: [],
        });
      },
    });
  });
};

export const importFromXLSX = async <T>(file: File): Promise<ImportResult<T>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as T[];
        
        resolve({
          data: jsonData,
          errors: [],
          warnings: [],
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.readAsBinaryString(file);
  });
};

export const importFromJSON = async <T>(file: File): Promise<ImportResult<T>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as T[];
        resolve({
          data,
          errors: [],
          warnings: [],
        });
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.readAsText(file);
  });
};

export const importData = async <T>(
  file: File,
  format: ImportFormat
): Promise<ImportResult<T>> => {
  switch (format) {
    case 'csv':
      return importFromCSV<T>(file);
    case 'xlsx':
      return importFromXLSX<T>(file);
    case 'json':
      return importFromJSON<T>(file);
    default:
      throw new Error(`Import format ${format} not supported`);
  }
};

export const validateImportData = <T extends Record<string, any>>(
  data: T[],
  requiredFields: (keyof T)[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field '${String(field)}'`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
