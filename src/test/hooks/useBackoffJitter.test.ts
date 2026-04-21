/**
 * Deterministic tests for the exponential-backoff jitter.
 *
 * Strategy: inject a controlled `rand` function so the output of
 * `calculateBackoffDelay` is fully predictable. This validates both the
 * exact formula and the *allowed interval* per attempt without relying
 * on Math.random (which causes flakiness in CI).
 *
 * Allowed interval per attempt:
 *   delay(n) ∈ [expDelay, expDelay * (1 + JITTER_FACTOR)]  (capped at maxDelay)
 * where expDelay = baseDelay * multiplier^(n - 1)
 */
import { describe, it, expect } from 'vitest';
import { calculateBackoffDelay, JITTER_FACTOR } from '@/hooks/useRetryMutation';

const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
const constRand = (v: number) => () => v;

describe('calculateBackoffDelay — deterministic jitter (injected rand)', () => {
  it('JITTER_FACTOR is the documented 0.3 (30%)', () => {
    expect(JITTER_FACTOR).toBe(0.3);
  });

  it('lower bound: rand=0 produces exactly base * multiplier^(n-1) for n=1..6', () => {
    const base = 1000;
    const mult = 2;
    for (let n = 1; n <= 6; n++) {
      const expected = base * Math.pow(mult, n - 1);
      expect(calculateBackoffDelay(n, base, 30000, mult, constRand(0))).toBe(
        Math.min(expected, 30000),
      );
    }
  });

  it('upper bound: rand≈1 produces expDelay * (1 + JITTER_FACTOR)', () => {
    const base = 1000;
    const mult = 2;
    const r = 0.999999;
    for (let n = 1; n <= 4; n++) {
      const expDelay = base * Math.pow(mult, n - 1);
      const expected = expDelay + r * JITTER_FACTOR * expDelay;
      expect(calculateBackoffDelay(n, base, 1_000_000, mult, constRand(r))).toBeCloseTo(
        expected,
        6,
      );
    }
  });

  it('midpoint: rand=0.5 produces expDelay * 1.15 (half of 30% jitter)', () => {
    const base = 1000;
    const mult = 2;
    for (let n = 1; n <= 4; n++) {
      const expDelay = base * Math.pow(mult, n - 1);
      expect(calculateBackoffDelay(n, base, 1_000_000, mult, constRand(0.5))).toBeCloseTo(
        expDelay * 1.15,
        6,
      );
    }
  });

  it('any rand∈[0,1] stays within the allowed interval [expDelay, expDelay*1.3]', () => {
    const base = 1000;
    const mult = 2;
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999];
    for (let n = 1; n <= 5; n++) {
      const expDelay = base * Math.pow(mult, n - 1);
      for (const r of samples) {
        const delay = calculateBackoffDelay(n, base, 1_000_000, mult, constRand(r));
        expect(delay).toBeGreaterThanOrEqual(expDelay);
        expect(delay).toBeLessThanOrEqual(expDelay * (1 + JITTER_FACTOR));
        // Exact formula
        expect(delay).toBeCloseTo(expDelay * (1 + JITTER_FACTOR * r), 6);
      }
    }
  });

  it('caps at maxDelay even when jitter would exceed it', () => {
    // n=20 with base=1000, mult=2 → exp = 1000 * 2^19 = 524_288_000
    // With max=30000 and rand=0.999, must be exactly 30000.
    expect(calculateBackoffDelay(20, 1000, 30000, 2, constRand(0.999))).toBe(30000);
  });

  it('caps when jitter alone pushes the delay above maxDelay', () => {
    // n=4 → expDelay = 8000. max=8500, rand=0.999 → 8000 + 8000*0.3*0.999 ≈ 10397.6 → cap 8500
    expect(calculateBackoffDelay(4, 1000, 8500, 2, constRand(0.999))).toBe(8500);
  });

  it('baseDelay=0 always returns 0 regardless of rand', () => {
    for (const r of [0, 0.5, 0.999]) {
      for (let n = 1; n <= 5; n++) {
        expect(calculateBackoffDelay(n, 0, 30000, 2, constRand(r))).toBe(0);
      }
    }
  });

  it('multiplier=1 keeps every attempt within [base, base*1.3]', () => {
    const base = 1000;
    for (let n = 1; n <= 10; n++) {
      const delay = calculateBackoffDelay(n, base, 30000, 1, constRand(0.7));
      expect(delay).toBeGreaterThanOrEqual(base);
      expect(delay).toBeLessThanOrEqual(base * (1 + JITTER_FACTOR));
      expect(delay).toBeCloseTo(base * (1 + JITTER_FACTOR * 0.7), 6);
    }
  });

  it('snapshot progression with rand=0.5 (base=100, mult=2)', () => {
    const r = constRand(0.5);
    // expDelay: 100, 200, 400, 800, 1600 → *1.15 → 115, 230, 460, 920, 1840
    const expected = [115, 230, 460, 920, 1840];
    for (let n = 1; n <= 5; n++) {
      expect(calculateBackoffDelay(n, 100, 100_000, 2, r)).toBeCloseTo(expected[n - 1], 6);
    }
  });

  it('strictly monotonic increase with fixed rand while not capped', () => {
    const r = constRand(0.5);
    let prev = -1;
    for (let n = 1; n <= 8; n++) {
      const d = calculateBackoffDelay(n, 1000, 1_000_000_000, 2, r);
      expect(d).toBeGreaterThan(prev);
      prev = d;
    }
  });

  it('sequential rand inputs map to sequential exact outputs (no hidden state)', () => {
    const rand = seq([0, 0.25, 0.5, 0.75, 0.999]);
    const base = 1000;
    const expDelay = base; // n=1
    const outs = [0, 0.25, 0.5, 0.75, 0.999].map(() =>
      calculateBackoffDelay(1, base, 100_000, 2, rand),
    );
    expect(outs).toEqual([
      expDelay * (1 + JITTER_FACTOR * 0),
      expDelay * (1 + JITTER_FACTOR * 0.25),
      expDelay * (1 + JITTER_FACTOR * 0.5),
      expDelay * (1 + JITTER_FACTOR * 0.75),
    ].concat(expDelay * (1 + JITTER_FACTOR * 0.999)).map(v => Number(v.toFixed(9))).map(v => v));
    // Sanity: values strictly increasing
    for (let i = 1; i < outs.length; i++) expect(outs[i]).toBeGreaterThan(outs[i - 1]);
  });

  it('audit: 100 calls with rand=0.5 sum to exactly 100 * expected (no drift)', () => {
    const r = constRand(0.5);
    const base = 1000;
    let total = 0;
    for (let i = 0; i < 100; i++) {
      total += calculateBackoffDelay(1, base, 100_000, 2, r);
    }
    expect(total).toBeCloseTo(100 * base * (1 + JITTER_FACTOR * 0.5), 6);
  });
});
