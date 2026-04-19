import { describe, it, expect } from 'vitest';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

/**
 * Re-implementação local da lógica de ordenação do leaderboard
 * (espelha useRaceLeaderboard), validada via property-based fuzz.
 */
function sortAndRank(rows: RaceLeaderboardEntry[]): RaceLeaderboardEntry[] {
  return [...rows]
    .sort((a, b) => Number(b.progress) - Number(a.progress))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

const make = (id: string, progress: number): RaceLeaderboardEntry =>
  ({
    season_id: 's1',
    car_id: id,
    salesperson_id: id,
    salesperson_name: id,
    avatar_url: null,
    car_number: 1,
    primary_color: '#000000',
    secondary_color: '#ffffff',
    car_style: 'f1',
    nickname: null,
    total_sales: 0,
    deals_count: 0,
    progress,
  } as RaceLeaderboardEntry);

describe('leaderboard ordering', () => {
  it('orders by progress desc', () => {
    const out = sortAndRank([make('a', 0.1), make('b', 0.9), make('c', 0.5)]);
    expect(out.map((r) => r.car_id)).toEqual(['b', 'c', 'a']);
  });

  it('assigns rank 1..N', () => {
    const out = sortAndRank([make('a', 0.1), make('b', 0.9), make('c', 0.5)]);
    expect(out.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('handles ties (stable enough; ranks still 1..N)', () => {
    const out = sortAndRank([make('a', 0.5), make('b', 0.5), make('c', 0.5)]);
    expect(out).toHaveLength(3);
    expect(out.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(sortAndRank([])).toEqual([]);
  });

  it('handles single entry', () => {
    const out = sortAndRank([make('solo', 0.42)]);
    expect(out[0].rank).toBe(1);
  });

  it('fuzz: 200 random arrays produce strictly non-increasing progress', () => {
    for (let i = 0; i < 200; i++) {
      const n = Math.floor(Math.random() * 30);
      const arr = Array.from({ length: n }, (_, k) => make(`s${k}`, Math.random()));
      const out = sortAndRank(arr);
      for (let j = 1; j < out.length; j++) {
        expect(Number(out[j - 1].progress)).toBeGreaterThanOrEqual(Number(out[j].progress));
      }
      // ranks contiguous
      out.forEach((r, idx) => expect(r.rank).toBe(idx + 1));
    }
  });
});
