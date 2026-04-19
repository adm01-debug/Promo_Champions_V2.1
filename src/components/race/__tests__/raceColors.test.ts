import { describe, it, expect } from 'vitest';
import {
  RACE_CAR_PRESETS,
  DEFAULT_PRESET_ID,
  getPresetById,
  inferPresetFromColors,
  RACE_CAR_COLORS,
  CAR_STYLES,
} from '../raceColors';

const HEX = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

describe('raceColors — RACE_CAR_PRESETS', () => {
  it('contains exactly 27 presets', () => {
    expect(RACE_CAR_PRESETS).toHaveLength(27);
  });

  it('all preset ids are unique', () => {
    const ids = RACE_CAR_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all preset names are unique', () => {
    const names = RACE_CAR_PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(RACE_CAR_PRESETS.map((p) => [p.id, p]))(
    'preset %s has valid shape, hex colors, style and emoji',
    (_id, preset) => {
      expect(preset.id).toMatch(/^[a-z0-9-]+$/);
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.name.length).toBeLessThan(60);
      expect(['f1', 'stock', 'kart']).toContain(preset.style);
      expect(preset.primary).toMatch(HEX);
      expect(preset.secondary).toMatch(HEX);
      if (preset.accent !== undefined) expect(preset.accent).toMatch(HEX);
      expect(preset.emoji.length).toBeGreaterThan(0);
      expect([
        'solid', 'stripes', 'flames', 'checkers', 'dots',
        'pride-rainbow', 'pride-rainbow-diagonal', 'pride-trans', 'pride-bi',
      ]).toContain(preset.pattern);
    }
  );

  it('contains at least 2 pride presets', () => {
    const pride = RACE_CAR_PRESETS.filter((p) => p.pride === true);
    expect(pride.length).toBeGreaterThanOrEqual(2);
    pride.forEach((p) => expect(p.pattern.startsWith('pride-')).toBe(true));
  });

  it('keeps "Scuderia a Mãe ta ON" at the end', () => {
    expect(RACE_CAR_PRESETS[RACE_CAR_PRESETS.length - 1].id).toBe('f1-mae-on');
  });

  it('user-defined order: rocket-man is first, gold-fury is 26th', () => {
    expect(RACE_CAR_PRESETS[0].id).toBe('rocket-man');
    expect(RACE_CAR_PRESETS[25].id).toBe('gold-fury');
  });
});

describe('raceColors — getPresetById', () => {
  it('returns first preset when id is null/undefined/empty', () => {
    expect(getPresetById(null)).toBe(RACE_CAR_PRESETS[0]);
    expect(getPresetById(undefined)).toBe(RACE_CAR_PRESETS[0]);
    expect(getPresetById('')).toBe(RACE_CAR_PRESETS[0]);
  });

  it('returns first preset for unknown id (fallback)', () => {
    expect(getPresetById('does-not-exist').id).toBe(RACE_CAR_PRESETS[0].id);
  });

  it.each(RACE_CAR_PRESETS.map((p) => p.id))(
    'returns matching preset for known id %s',
    (id) => {
      expect(getPresetById(id).id).toBe(id);
    }
  );

  it('DEFAULT_PRESET_ID points to a known preset', () => {
    expect(RACE_CAR_PRESETS.some((p) => p.id === DEFAULT_PRESET_ID)).toBe(true);
  });
});

describe('raceColors — inferPresetFromColors', () => {
  it.each(RACE_CAR_PRESETS.map((p) => [p.primary, p.style, p.id]))(
    'matches preset with primary=%s style=%s',
    (primary, style, expectedId) => {
      const r = inferPresetFromColors(primary as string, style as 'f1');
      // multiple presets may share the same primary/style; ensure result has same primary+style
      expect(r.style).toBe(style);
      expect(r.primary.toLowerCase()).toBe((primary as string).toLowerCase());
      expect(typeof expectedId).toBe('string');
    }
  );

  it('falls back to first preset of same style when no exact match', () => {
    const r = inferPresetFromColors('#123456', 'f1');
    expect(r.style).toBe('f1');
  });

  it('falls back to first preset of array when style has no entries', () => {
    const r = inferPresetFromColors('#123456', 'stock');
    expect(r).toBe(RACE_CAR_PRESETS[0]);
  });

  it('is case-insensitive on hex matching', () => {
    const p = RACE_CAR_PRESETS[0];
    const r = inferPresetFromColors(p.primary.toUpperCase(), p.style);
    expect(r.primary.toLowerCase()).toBe(p.primary.toLowerCase());
  });

  // Fuzz: 1000 random calls never throw and always return a valid preset
  it('fuzz: 1000 random color/style inputs return a valid preset', () => {
    const styles: Array<'f1' | 'stock' | 'kart'> = ['f1', 'stock', 'kart'];
    for (let i = 0; i < 1000; i++) {
      const r = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
      const s = styles[i % 3];
      const out = inferPresetFromColors(`#${r}`, s);
      expect(out).toBeDefined();
      expect(RACE_CAR_PRESETS).toContain(out);
    }
  });
});

describe('raceColors — legacy exports', () => {
  it('RACE_CAR_COLORS preserves first 12 preset names/colors', () => {
    expect(RACE_CAR_COLORS).toHaveLength(12);
    RACE_CAR_COLORS.forEach((c, i) => {
      expect(c.name).toBe(RACE_CAR_PRESETS[i].name);
      expect(c.primary).toBe(RACE_CAR_PRESETS[i].primary);
      expect(c.secondary).toBe(RACE_CAR_PRESETS[i].secondary);
    });
  });

  it('CAR_STYLES has exactly 3 entries', () => {
    expect(CAR_STYLES).toHaveLength(3);
    expect(CAR_STYLES.map((s) => s.value).sort()).toEqual(['f1', 'kart', 'stock']);
  });
});
