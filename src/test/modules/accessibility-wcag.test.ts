/**
 * Accessibility & WCAG Compliance Tests
 * Tests: contrast ratios, ARIA patterns, keyboard nav, focus management, screen reader
 */
import { describe, it, expect } from 'vitest';

describe('Contrast Ratio - WCAG AA', () => {
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (l1: number, l2: number): number => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
  };

  const meetsAA = (ratio: number, isLargeText: boolean = false): boolean => {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  };

  const meetsAAA = (ratio: number, isLargeText: boolean = false): boolean => {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  };

  it('should calculate contrast of black on white', () => {
    const white = getLuminance(255, 255, 255);
    const black = getLuminance(0, 0, 0);
    expect(getContrastRatio(white, black)).toBe(21);
  });

  it('should meet AA for high contrast', () => {
    expect(meetsAA(5.5)).toBe(true);
  });

  it('should fail AA for low contrast', () => {
    expect(meetsAA(3.0)).toBe(false);
  });

  it('should have relaxed AA for large text', () => {
    expect(meetsAA(3.5, true)).toBe(true);
  });

  it('should check AAA compliance', () => {
    expect(meetsAAA(8)).toBe(true);
    expect(meetsAAA(5)).toBe(false);
  });
});

describe('ARIA - Required Attributes', () => {
  const REQUIRED_ARIA: Record<string, string[]> = {
    dialog: ['aria-labelledby', 'role'],
    alert: ['role', 'aria-live'],
    tab: ['role', 'aria-selected', 'aria-controls'],
    tabpanel: ['role', 'aria-labelledby'],
    combobox: ['role', 'aria-expanded', 'aria-haspopup'],
    progressbar: ['role', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  };

  const validateAria = (component: string, attributes: string[]): { valid: boolean; missing: string[] } => {
    const required = REQUIRED_ARIA[component] || [];
    const missing = required.filter(attr => !attributes.includes(attr));
    return { valid: missing.length === 0, missing };
  };

  it('should validate complete dialog', () => {
    expect(validateAria('dialog', ['aria-labelledby', 'role']).valid).toBe(true);
  });

  it('should detect missing attributes', () => {
    const result = validateAria('progressbar', ['role']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('aria-valuenow');
  });

  it('should handle unknown component', () => {
    expect(validateAria('custom', ['anything']).valid).toBe(true);
  });
});

describe('Keyboard Navigation - Focus Order', () => {
  const validateFocusOrder = (elements: { tabIndex: number; id: string }[]): string[] => {
    return [...elements]
      .filter(e => e.tabIndex >= 0)
      .sort((a, b) => {
        if (a.tabIndex === 0 && b.tabIndex === 0) return 0;
        if (a.tabIndex === 0) return 1;
        if (b.tabIndex === 0) return -1;
        return a.tabIndex - b.tabIndex;
      })
      .map(e => e.id);
  };

  it('should order by tabIndex', () => {
    const elements = [
      { tabIndex: 0, id: 'main' },
      { tabIndex: 2, id: 'second' },
      { tabIndex: 1, id: 'first' },
    ];
    expect(validateFocusOrder(elements)).toEqual(['first', 'second', 'main']);
  });

  it('should skip negative tabIndex', () => {
    const elements = [
      { tabIndex: 0, id: 'a' },
      { tabIndex: -1, id: 'hidden' },
    ];
    expect(validateFocusOrder(elements)).toEqual(['a']);
  });
});

describe('Touch Target - Minimum Size', () => {
  const MIN_TOUCH_TARGET = 44; // WCAG 2.5.5

  const validateTouchTarget = (width: number, height: number): { valid: boolean; issue?: string } => {
    if (width < MIN_TOUCH_TARGET && height < MIN_TOUCH_TARGET) {
      return { valid: false, issue: `Ambas dimensões (${width}x${height}) abaixo de ${MIN_TOUCH_TARGET}px` };
    }
    if (width < MIN_TOUCH_TARGET) return { valid: false, issue: `Largura ${width}px abaixo de ${MIN_TOUCH_TARGET}px` };
    if (height < MIN_TOUCH_TARGET) return { valid: false, issue: `Altura ${height}px abaixo de ${MIN_TOUCH_TARGET}px` };
    return { valid: true };
  };

  it('should validate adequate targets', () => {
    expect(validateTouchTarget(48, 48).valid).toBe(true);
  });

  it('should reject small targets', () => {
    expect(validateTouchTarget(32, 32).valid).toBe(false);
  });

  it('should check each dimension', () => {
    expect(validateTouchTarget(30, 48).valid).toBe(false);
    expect(validateTouchTarget(48, 30).valid).toBe(false);
  });
});

describe('Color Blindness - Accessible Palette', () => {
  const isColorBlindSafe = (colors: string[]): boolean => {
    // Simplified check: ensure we don't rely only on red/green distinction
    const hasRedGreenPair = colors.some(c => c.includes('red')) && colors.some(c => c.includes('green'));
    return !hasRedGreenPair || colors.length > 2; // OK if there are additional cues
  };

  const addPatternCue = (dataPoints: { color: string; label: string }[]): (typeof dataPoints[0] & { pattern?: string })[] => {
    const patterns = ['solid', 'striped', 'dotted', 'dashed', 'crosshatch'];
    return dataPoints.map((dp, i) => ({ ...dp, pattern: patterns[i % patterns.length] }));
  };

  it('should flag red-green only palette', () => {
    expect(isColorBlindSafe(['red', 'green'])).toBe(false);
  });

  it('should allow multi-color palette', () => {
    expect(isColorBlindSafe(['red', 'green', 'blue'])).toBe(true);
  });

  it('should add pattern cues', () => {
    const data = [{ color: 'red', label: 'A' }, { color: 'blue', label: 'B' }];
    const result = addPatternCue(data);
    expect(result[0].pattern).toBe('solid');
    expect(result[1].pattern).toBe('striped');
  });
});

describe('Screen Reader - Alt Text Validation', () => {
  const validateAltText = (alt: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    if (!alt || !alt.trim()) issues.push('Alt text ausente');
    if (alt && alt.length > 125) issues.push('Alt text muito longo (máx 125 chars)');
    if (alt && /^(image|imagem|foto|picture|icon|ícone)/i.test(alt)) issues.push('Não inicie com "imagem de" ou "foto de"');
    if (alt && /\.(jpg|png|gif|svg|webp)$/i.test(alt)) issues.push('Não use nome de arquivo como alt text');
    return { valid: issues.length === 0, issues };
  };

  it('should validate good alt text', () => {
    expect(validateAltText('Dashboard de vendas do mês de março').valid).toBe(true);
  });

  it('should reject empty alt', () => {
    expect(validateAltText('').valid).toBe(false);
  });

  it('should reject file names', () => {
    expect(validateAltText('screenshot.png').valid).toBe(false);
  });

  it('should warn about "image of" prefix', () => {
    expect(validateAltText('Imagem de um gráfico').valid).toBe(false);
  });
});
