import * as XLSX from 'xlsx';
import { z } from 'zod';
import { ImportResult } from './csvImporter';

export async function importExcel<T>(file: File, schema: z.ZodSchema<T>): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        const success: T[] = [];
        const errors: { row: number; field: string; error: string }[] = [];
        
        json.forEach((row: any, idx: number) => {
          try {
            success.push(schema.parse(row));
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({ row: idx + 2, field: err.path.join('.'), error: err.message });
              });
            }
          }
        });
        
        resolve({ success, errors, total: json.length });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
