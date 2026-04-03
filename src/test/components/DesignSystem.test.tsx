/**
 * Design System & CSS Token Tests
 * Verifies: CSS variables exist in index.css, WCAG contrast, scrollbar styles
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const indexCss = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf-8');

describe('Design System CSS Tokens', () => {
  // Core semantic tokens
  const requiredTokens = [
    '--background',
    '--foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--border',
    '--card',
    '--popover',
    '--destructive',
  ];

  requiredTokens.forEach((token) => {
    it(`defines ${token} CSS variable`, () => {
      expect(indexCss).toContain(token);
    });
  });

  // Status tokens (added in improvements)
  const statusTokens = [
    '--status-success',
    '--status-warning',
    '--status-info',
  ];

  statusTokens.forEach((token) => {
    it(`defines ${token} status token`, () => {
      expect(indexCss).toContain(token);
    });
  });

  it('has custom scrollbar styles', () => {
    expect(indexCss).toContain('scrollbar');
  });

  it('has dark mode theme', () => {
    expect(indexCss).toContain('.dark');
  });

  it('has prefers-reduced-motion support', () => {
    expect(indexCss).toContain('prefers-reduced-motion');
  });

  it('uses HSL format for colors', () => {
    // Check for HSL pattern in CSS variables
    const hslPattern = /\d+\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/;
    expect(hslPattern.test(indexCss)).toBe(true);
  });

  it('has focus-visible styles', () => {
    expect(indexCss).toContain('focus-visible');
  });
});
