import { describe, expect, it } from 'vitest';
import { winRate } from './winRate';

describe('winRate — fonte única da fórmula', () => {
  it('calcula percentual entre deals decididos', () => {
    expect(winRate(3, 1)).toBe(75);
    expect(winRate(1, 3)).toBe(25);
  });

  it('retorna 0 quando não há deals decididos', () => {
    expect(winRate(0, 0)).toBe(0);
  });

  it('retorna 100 quando só há vitórias', () => {
    expect(winRate(5, 0)).toBe(100);
  });

  it('retorna 0 quando só há derrotas', () => {
    expect(winRate(0, 5)).toBe(0);
  });

  it('retorna float sem arredondamento implícito', () => {
    expect(winRate(1, 2)).toBeCloseTo(33.333, 3);
  });
});
