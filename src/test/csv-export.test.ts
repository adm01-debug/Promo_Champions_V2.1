import { describe, it, expect, vi } from "vitest";
import { 
  formatDateForExport, 
  formatPercentForExport, 
  formatCurrencyForExport,
  exportToCSV
} from "../utils/csvExport";

describe("CSV Export Utils", () => {
  it("formatDateForExport should format correctly", () => {
    const date = "2024-01-01T12:00:00Z";
    expect(formatDateForExport(date)).toBe("01/01/2024");
  });

  it("formatPercentForExport should format correctly", () => {
    expect(formatPercentForExport(0.85)).toBe("85.0%");
    expect(formatPercentForExport(0.1234)).toBe("12.3%");
  });

  it("formatCurrencyForExport should format correctly", () => {
    // Note: Intl results can vary by environment, but we expect a string containing symbols
    const result = formatCurrencyForExport(1234.56);
    expect(result).toContain("R$");
    expect(result).toContain("1.234,56");
  });

  it("exportToCSV should handle empty data", () => {
    const spy = vi.spyOn(document, 'createElement');
    exportToCSV([], "test");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
