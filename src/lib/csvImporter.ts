import Papa from 'papaparse';
import { z } from 'zod';

export interface ImportResult<T> {
  success: T[];
  errors: { row: number; field: string; error: string }[];
  total: number;
}

export async function importCSV<T>(
  file: File,
  schema: z.ZodSchema<T>
): Promise<ImportResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const success: T[] = [];
        const errors: { row: number; field: string; error: string }[] = [];
        
        results.data.forEach((row: any, idx: number) => {
          try {
            success.push(schema.parse(row));
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({ row: idx + 1, field: err.path.join('.'), error: err.message });
              });
            }
          }
        });

        resolve({ success, errors, total: results.data.length });
      },
    });
  });
}
