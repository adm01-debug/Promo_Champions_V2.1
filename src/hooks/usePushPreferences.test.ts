import { describe, expect, it } from 'vitest';
import {
  PUSH_DEFAULTS,
  isPushSuppressed,
  sanitizePushPreferences,
} from './usePushPreferences';

const at = (hh: number, mm = 0) => new Date(2026, 0, 15, hh, mm, 0, 0);

describe('sanitizePushPreferences', () => {
  it('devolve os padrões quando nada foi gravado', () => {
    expect(sanitizePushPreferences(undefined)).toEqual(PUSH_DEFAULTS);
    expect(sanitizePushPreferences({})).toEqual(PUSH_DEFAULTS);
  });

  it('preserva escolhas válidas e descarta lixo', () => {
    const result = sanitizePushPreferences({
      categories: { milestones: false, streaks: 'nao' },
      quietHoursEnabled: true,
      quietHoursStart: '25:00',
      quietHoursEnd: '06:30',
    });
    expect(result.categories.milestones).toBe(false);
    expect(result.categories.streaks).toBe(true);
    expect(result.quietHoursEnabled).toBe(true);
    expect(result.quietHoursStart).toBe(PUSH_DEFAULTS.quietHoursStart);
    expect(result.quietHoursEnd).toBe('06:30');
  });
});

describe('isPushSuppressed', () => {
  it('respeita categoria desligada sem afetar as demais', () => {
    const prefs = {
      ...PUSH_DEFAULTS,
      categories: { ...PUSH_DEFAULTS.categories, sdr_alerts: false },
    };
    expect(isPushSuppressed(prefs, 'sdr_alerts', at(12))).toBe(true);
    expect(isPushSuppressed(prefs, 'streaks', at(12))).toBe(false);
    expect(isPushSuppressed(prefs, undefined, at(12))).toBe(false);
  });

  it('trata janela que cruza a meia-noite como intervalo contínuo', () => {
    const prefs = {
      ...PUSH_DEFAULTS,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
    expect(isPushSuppressed(prefs, undefined, at(23))).toBe(true);
    expect(isPushSuppressed(prefs, undefined, at(6, 59))).toBe(true);
    expect(isPushSuppressed(prefs, undefined, at(7))).toBe(false);
    expect(isPushSuppressed(prefs, undefined, at(15))).toBe(false);
  });

  it('não suprime quando o silêncio está desligado', () => {
    const prefs = {
      ...PUSH_DEFAULTS,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
    expect(isPushSuppressed(prefs, undefined, at(23))).toBe(false);
  });
});
