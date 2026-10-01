import { describe, it, expect } from 'vitest';
import { getCelebrationIntensity } from './getCelebrationIntensity';

describe('getCelebrationIntensity', () => {
  it('sem salto de posição não celebra (score 0, sem som/duração)', () => {
    const r = getCelebrationIntensity({ fromRank: 5, toRank: 5 });
    expect(r).toEqual({ score: 0, shake: false, fireworks: 0, sound: 'none', duration: 0 });
    expect(getCelebrationIntensity({ fromRank: 2, toRank: 7 }).score).toBe(0);
  });

  it('salto pequeno dispara celebração mínima (pulse, sem shake)', () => {
    const r = getCelebrationIntensity({ fromRank: 6, toRank: 5 });
    expect(r.score).toBe(8); // jump=1 → 8
    expect(r.sound).toBe('pulse');
    expect(r.shake).toBe(false);
    expect(r.fireworks).toBe(0);
    expect(r.duration).toBe(600);
  });

  it('faixa intermediária: 1 burst + cheer a partir de score 30', () => {
    const r = getCelebrationIntensity({ fromRank: 10, toRank: 6 });
    expect(r.score).toBe(32); // jump=4 → 32
    expect(r.fireworks).toBe(1);
    expect(r.sound).toBe('cheer');
    expect(r.shake).toBe(false);
  });

  it('score >= 55: 2 bursts com shake', () => {
    const r = getCelebrationIntensity({ fromRank: 15, toRank: 8 });
    expect(r.score).toBe(56); // jump=7 → 56
    expect(r.shake).toBe(true);
    expect(r.fireworks).toBe(2);
    expect(r.sound).toBe('cheer');
  });

  it('score >= 80: máximo — 3 bursts, horn e 2400ms', () => {
    const r = getCelebrationIntensity({ fromRank: 12, toRank: 2, isTop3: true });
    expect(r.score).toBe(80); // jump=10 → 60 capped + top3 20 = 80
    expect(r.shake).toBe(true);
    expect(r.fireworks).toBe(3);
    expect(r.sound).toBe('horn');
    expect(r.duration).toBe(2400);
  });

  it('bônus de top-3, P1 e takeover acumulam', () => {
    const base = getCelebrationIntensity({ fromRank: 5, toRank: 4 });
    const top3 = getCelebrationIntensity({ fromRank: 5, toRank: 4, isTop3: true });
    const leader = getCelebrationIntensity({ fromRank: 5, toRank: 1, isTop3: true });
    const takeover = getCelebrationIntensity({
      fromRank: 5,
      toRank: 1,
      isTop3: true,
      isTakeover: true,
    });
    expect(top3.score).toBe(base.score + 20);
    expect(leader.score).toBe(top3.score + 15 + 24); // jump 4 vs 1 → +24 jump diff +15 P1
    expect(takeover.score).toBe(leader.score + 25);
  });

  it('score é clampado em 100', () => {
    const r = getCelebrationIntensity({
      fromRank: 50,
      toRank: 1,
      isTop3: true,
      isTakeover: true,
    });
    expect(r.score).toBe(100);
  });
});
