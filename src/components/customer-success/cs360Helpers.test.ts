import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatBRL, daysUntil, renewalSemaphore } from "./cs360Helpers";

describe("cs360Helpers", () => {
  describe("formatBRL", () => {
    it("formats positive numbers as BRL currency", () => {
      // Use a regex to be more flexible with non-breaking spaces
      const result = formatBRL(1250);
      expect(result).toMatch(/R\$\s?1\.250/);
    });

    it("formats zero correctly", () => {
      const result = formatBRL(0);
      expect(result).toMatch(/R\$\s?0/);
    });

    it("handles large numbers", () => {
      const result = formatBRL(1000000);
      expect(result).toMatch(/R\$\s?1\.000\.000/);
    });
  });

  describe("daysUntil", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-05-01"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns null if date is null", () => {
      expect(daysUntil(null)).toBeNull();
    });

    it("calculates positive days correctly", () => {
      expect(daysUntil("2024-05-11")).toBe(10);
    });

    it("calculates negative days for past dates", () => {
      expect(daysUntil("2024-04-21")).toBe(-10);
    });

    it("returns 0 for the same day", () => {
      expect(daysUntil("2024-05-01")).toBe(0);
    });
  });

  describe("renewalSemaphore", () => {
    it("returns gray for null days", () => {
      expect(renewalSemaphore(null)).toBe("gray");
    });

    it("returns red for negative days", () => {
      expect(renewalSemaphore(-5)).toBe("red");
    });

    it("returns red for days <= 30", () => {
      expect(renewalSemaphore(15)).toBe("red");
      expect(renewalSemaphore(30)).toBe("red");
    });

    it("returns orange for days between 31 and 60", () => {
      expect(renewalSemaphore(45)).toBe("orange");
      expect(renewalSemaphore(60)).toBe("orange");
    });

    it("returns yellow for days between 61 and 90", () => {
      expect(renewalSemaphore(75)).toBe("yellow");
      expect(renewalSemaphore(90)).toBe("yellow");
    });

    it("returns green for days > 90", () => {
      expect(renewalSemaphore(91)).toBe("green");
      expect(renewalSemaphore(365)).toBe("green");
    });
  });
});
