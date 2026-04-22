/**
 * Deterministic tests focused on the maxDelay cap invariant of
 * calculateBackoffDelay (src/hooks/useRetryMutation.ts).
 *
 * Contract under test:
 *   delay(n) = min(expDelay + rand() * JITTER_FACTOR * expDelay, maxDelay)
 *   ⇒ delay(n) ≤ maxDelay  for all n ≥ 1, all rand ∈ [0, 1)
 *
 * Three regimes are covered:
 *   1. expDelay alone < maxDelay (no cap)
 *   2. expDelay < maxDelay but expDelay + jitter > maxDelay (cap engages on jitter)
 *   3. expDelay ≥ maxDelay (cap engages on the exponential itself)
 *
 * `rand` is injected, so every assertion is deterministic — no Math.random.
 *
 * Note: the edge function dispatcher (winloss-webhook-dispatcher/retry.ts)
 * uses a different contract (cap applies only to the base, jitter added after),
 * so it is intentionally out of scope here.
 */
import { describe, it, expect } from 'vitest';
import { calculateBackoffDelay, JITTER_FACTOR } from '@/hooks/useRetryMutation';

const constRand = (v: number) => () => v;
const MAX_RAND = 0.9999999999; // sup of [0, 1) — worst-case jitter

describe('calculateBackoffDelay — maxDelay cap (deterministic)', () => {
  it('with maximum jitter, delay never exceeds maxDelay across n=1..30', () => {
    const base = 1000;
    const mult = 2;
    const maxDelay = 30_000;
    for (let n = 1; n <= 30; n++) {
      const delay = calculateBackoffDelay(n, base, maxDelay, mult, constRand(MAX_RAND));
      expect(delay).toBeLessThanOrEqual(maxDelay);
    }
  });

  it('with minimum jitter (rand=0), delay never exceeds maxDelay across n=1..30', () => {
    const base = 1000;
    const mult = 2;
    const maxDelay = 30_000;
    for (let n = 1; n <= 30; n++) {
      const delay = calculateBackoffDelay(n, base, maxDelay, mult, constRand(0));
      expect(delay).toBeLessThanOrEqual(maxDelay);
    }
  });

  it('property: across rand∈{0,0.25,0.5,0.75,~1} × n∈1..20, delay ≤ maxDelay', () => {
    const base = 500;
    const mult = 2;
    const maxDelay = 10_000;
    const rands = [0, 0.25, 0.5, 0.75, MAX_RAND];
    for (const r of rands) {
      for (let n = 1; n <= 20; n++) {
        const delay = calculateBackoffDelay(n, base, maxDelay, mult, constRand(r));
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    }
  });

  it('regime 1 — uncapped: equals expDelay*(1 + JITTER_FACTOR*r) when far below cap', () => {
    // n=3, base=100, mult=2 → expDelay=400, max=10_000 → never capped
    const expDelay = 400;
    expect(calculateBackoffDelay(3, 100, 10_000, 2, constRand(0))).toBeCloseTo(expDelay, 6);
    expect(calculateBackoffDelay(3, 100, 10_000, 2, constRand(0.5))).toBeCloseTo(
      expDelay * (1 + JITTER_FACTOR * 0.5),
      6,
    );
    expect(calculateBackoffDelay(3, 100, 10_000, 2, constRand(MAX_RAND))).toBeLessThan(10_000);
  });

  it('regime 2 — jitter pushes over cap: returns exactly maxDelay', () => {
    // n=4, base=1000, mult=2 → expDelay=8000, max=8500
    //   rand=0     → 8000              (uncapped)
    //   rand=0.20  → 8000+8000*0.3*0.2 = 8480  (uncapped, on the limit)
    //   rand=0.21  → 8000+8000*0.3*0.21 ≈ 8504 → cap 8500
    //   rand=MAX   → cap 8500
    expect(calculateBackoffDelay(4, 1000, 8500, 2, constRand(0))).toBe(8000);
    expect(calculateBackoffDelay(4, 1000, 8500, 2, constRand(0.2))).toBeCloseTo(8480, 6);
    expect(calculateBackoffDelay(4, 1000, 8500, 2, constRand(0.21))).toBe(8500);
    expect(calculateBackoffDelay(4, 1000, 8500, 2, constRand(MAX_RAND))).toBe(8500);
  });

  it('regime 3 — exponential alone ≥ cap: returns exactly maxDelay even with rand=0', () => {
    // n=10, base=1000, mult=2 → expDelay = 1000 * 2^9 = 512_000 ≫ 30_000
    expect(calculateBackoffDelay(10, 1000, 30_000, 2, constRand(0))).toBe(30_000);
    expect(calculateBackoffDelay(10, 1000, 30_000, 2, constRand(0.5))).toBe(30_000);
    expect(calculateBackoffDelay(10, 1000, 30_000, 2, constRand(MAX_RAND))).toBe(30_000);
    // Very high attempt count — cap holds.
    expect(calculateBackoffDelay(50, 1000, 30_000, 2, constRand(MAX_RAND))).toBe(30_000);
  });

  it('boundary — expDelay == maxDelay: any positive jitter caps to maxDelay', () => {
    // n=4, base=1000, mult=2 → expDelay = 8000 == maxDelay
    expect(calculateBackoffDelay(4, 1000, 8000, 2, constRand(0))).toBe(8000);
    expect(calculateBackoffDelay(4, 1000, 8000, 2, constRand(0.0001))).toBe(8000);
    expect(calculateBackoffDelay(4, 1000, 8000, 2, constRand(MAX_RAND))).toBe(8000);
  });

  it('cap is monotonic: once an attempt hits the cap, all later attempts also hit it', () => {
    const base = 1000;
    const mult = 2;
    const max = 8000;
    const r = constRand(MAX_RAND);
    let firstCappedAt = -1;
    for (let n = 1; n <= 12; n++) {
      const d = calculateBackoffDelay(n, base, max, mult, r);
      if (d === max && firstCappedAt < 0) firstCappedAt = n;
      if (firstCappedAt > 0) expect(d).toBe(max);
    }
    expect(firstCappedAt).toBeGreaterThan(0);
  });

  it('different maxDelays: smaller cap engages earlier (all ≤ maxDelay)', () => {
    const base = 1000;
    const mult = 2;
    const r = constRand(MAX_RAND);
    // For attempt=4, expDelay=8000.
    // max=4000  → cap 4000
    // max=8000  → expDelay==max, jitter pushes over → cap 8000
    // max=20000 → 8000 + 8000*0.3*~1 ≈ 10399.97 (uncapped)
    expect(calculateBackoffDelay(4, base, 4_000, mult, r)).toBe(4_000);
    expect(calculateBackoffDelay(4, base, 8_000, mult, r)).toBe(8_000);
    const uncapped = calculateBackoffDelay(4, base, 20_000, mult, r);
    expect(uncapped).toBeGreaterThan(8_000);
    expect(uncapped).toBeLessThan(20_000);
  });

  it('extreme: maxDelay smaller than baseDelay caps from attempt 1 onward', () => {
    expect(calculateBackoffDelay(1, 5_000, 1_000, 2, constRand(0))).toBe(1_000);
    expect(calculateBackoffDelay(1, 5_000, 1_000, 2, constRand(MAX_RAND))).toBe(1_000);
    for (let n = 1; n <= 10; n++) {
      expect(calculateBackoffDelay(n, 5_000, 1_000, 2, constRand(MAX_RAND))).toBe(1_000);
    }
  });

  it('maxDelay=0 forces every delay to 0 regardless of rand or attempt', () => {
    for (const r of [0, 0.5, MAX_RAND]) {
      for (let n = 1; n <= 5; n++) {
        expect(calculateBackoffDelay(n, 1000, 0, 2, constRand(r))).toBe(0);
      }
    }
  });
});
