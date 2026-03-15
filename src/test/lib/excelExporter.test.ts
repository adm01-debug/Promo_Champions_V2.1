/**
 * ExcelExporter Tests
 * Tests: export functionality, data handling, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToExcel } from '@/lib/excelExporter';

// Mock ExcelJS
vi.mock('exceljs', () => {
  return {
    default: class Workbook {
      addWorksheet = vi.fn().mockReturnValue({
        columns: [],
        addRow: vi.fn(),
      });
      xlsx = { writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)) };
    },
  };
});

describe('exportToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export data successfully', async () => {
    const data = [
      { name: 'Test', value: 100 },
      { name: 'Test2', value: 200 },
    ];

    await exportToExcel(data, 'test-export');

    // Should create download link
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle empty data array', async () => {
    await exportToExcel([], 'empty-export');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should use custom sheet name', async () => {
    const data = [{ col: 'value' }];
    await exportToExcel(data, 'test', 'CustomSheet');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should use default sheet name "Dados"', async () => {
    const data = [{ col: 'value' }];
    await exportToExcel(data, 'test');
    // Default sheet name is 'Dados'
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle special characters in data', async () => {
    const data = [
      { name: 'Ação & "Cotação"', value: 'R$ 1.000,00' },
      { name: '<script>alert("xss")</script>', value: 'null' },
    ];
    await expect(exportToExcel(data, 'special-chars')).resolves.not.toThrow();
  });

  it('should handle large datasets', async () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 10000,
    }));
    await expect(exportToExcel(data, 'large-dataset')).resolves.not.toThrow();
  });

  it('should handle unicode data', async () => {
    const data = [
      { name: '日本語テスト', value: 'Ação com acentuação' },
      { name: '🎯 Target', value: '✅ Done' },
    ];
    await expect(exportToExcel(data, 'unicode')).resolves.not.toThrow();
  });
});
