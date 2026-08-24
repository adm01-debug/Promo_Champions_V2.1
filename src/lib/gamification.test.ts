import { describe, it, expect } from 'vitest';
import { getLevelFromXP, getLevelInfo, getXPForNextLevel, formatXP, LEVELS } from './gamification';

describe('getLevelFromXP', () => {
  it('retorna nível 1 para XP 0', () => {
    const l = getLevelFromXP(0);
    expect(l.level).toBe(1);
    expect(l.title).toBe('Iniciante');
    expect(l.progressPercent).toBe(0);
  });

  it('retorna nível correto no limiar inferior', () => {
    expect(getLevelFromXP(100).level).toBe(2);
    expect(getLevelFromXP(300).level).toBe(3);
    expect(getLevelFromXP(19000).level).toBe(20);
  });

  it('progressPercent aumenta dentro do nível', () => {
    const l = getLevelFromXP(200); // meio do nível 2 (100–300)
    expect(l.level).toBe(2);
    expect(l.progressPercent).toBeCloseTo(50, 1);
  });

  it('nível 20 (Onipotente) trata maxXP infinito', () => {
    const l = getLevelFromXP(50000);
    expect(l.level).toBe(20);
    expect(l.progressPercent).toBe(0); // (50000-19000)/Infinity = 0
  });

  it('lida com XP negativo devolvendo nível 1', () => {
    const l = getLevelFromXP(-50);
    expect(l.level).toBe(1);
  });
});

describe('getLevelInfo', () => {
  it('retorna info sem progressPercent', () => {
    const i = getLevelInfo(5);
    expect(i.level).toBe(5);
    expect(i.title).toBe('Proficiente');
    expect('progressPercent' in i).toBe(false);
  });

  it('clamp em level < 1', () => {
    expect(getLevelInfo(-5).level).toBe(1);
    expect(getLevelInfo(0).level).toBe(1);
  });

  it('clamp em level > 20', () => {
    expect(getLevelInfo(999).level).toBe(20);
  });
});

describe('getXPForNextLevel', () => {
  it('devolve XP restante para próximo nível', () => {
    expect(getXPForNextLevel(50)).toBe(50);   // 100-50
    expect(getXPForNextLevel(250)).toBe(50);  // 300-250
  });

  it('devolve 0 no nível máximo', () => {
    expect(getXPForNextLevel(30000)).toBe(0);
  });
});

describe('formatXP', () => {
  it('formata < 1000 como número', () => {
    expect(formatXP(0)).toBe('0');
    expect(formatXP(999)).toBe('999');
  });

  it('formata >= 1000 como k', () => {
    expect(formatXP(1000)).toBe('1.0k');
    expect(formatXP(1500)).toBe('1.5k');
    expect(formatXP(25400)).toBe('25.4k');
  });
});

describe('LEVELS invariantes', () => {
  it('20 níveis definidos', () => {
    expect(LEVELS).toHaveLength(20);
  });

  it('minXP monotonicamente crescente', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXP).toBeGreaterThan(LEVELS[i - 1].minXP);
    }
  });

  it('maxXP do nível N === minXP do nível N+1', () => {
    for (let i = 0; i < LEVELS.length - 1; i++) {
      expect(LEVELS[i].maxXP).toBe(LEVELS[i + 1].minXP);
    }
  });
});
