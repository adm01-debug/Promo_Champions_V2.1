/**
 * ExcelExporter Tests
 * Tests: export functionality, data handling, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('exceljs', () => {
  class MockWorkbook {
    addWorksheet() {
      return { columns: null, addRow: vi.fn() };
    }
    xlsx = { writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)) };
  }

  return { default: { Workbook: MockWorkbook }, __esModule: true };
});

import { exportToExcel } from '@/lib/excelExporter';

describe('exportToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export data successfully', async () => {
    const data = [{ name: 'Test', value: 100 }];
    await exportToExcel(data, 'test-export');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle empty data array', async () => {
    await exportToExcel([], 'empty-export');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should use custom sheet name', async () => {
    await exportToExcel([{ col: 'value' }], 'test', 'CustomSheet');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should use default sheet name', async () => {
    await exportToExcel([{ col: 'value' }], 'test');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle special characters', async () => {
    const data = [{ name: '<script>alert("xss")</script>' }];
    await expect(exportToExcel(data, 'xss')).resolves.not.toThrow();
  });

  it('should handle large datasets', async () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    await expect(exportToExcel(data, 'large')).resolves.not.toThrow();
  });

  it('should handle unicode data', async () => {
    const data = [{ name: '🎯 日本語' }];
    await expect(exportToExcel(data, 'unicode')).resolves.not.toThrow();
  });
});
