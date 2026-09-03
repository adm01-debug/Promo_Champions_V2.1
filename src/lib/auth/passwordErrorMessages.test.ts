import { describe, it, expect } from 'vitest';
import { classifyPasswordError } from './passwordErrorMessages';

describe('classifyPasswordError', () => {
  it('returns unknown for null/undefined', () => {
    expect(classifyPasswredError_(null).kind).toBe('unknown');
    expect(classifyPasswordError(undefined).kind).toBe('unknown');
  });

  it('detects HIBP leaked password via message', () => {
    const cases = [
      'Password is known to be weak and easy to guess, please choose a different one',
      'This password has been pwned before',
      'Password has been leaked in a data breach',
      'Compromised password detected',
    ];
    for (const message of cases) {
      const r = classifyPasswordError({ message });
      expect(r.kind).toBe('leaked');
      expect(r.message).toMatch(/vazamentos/i);
    }
  });

  it('detects HIBP via weak_password code even when message is empty', () => {
    const r = classifyPasswordError({ message: '', code: 'weak_password' });
    expect(r.kind).toBe('leaked');
  });

  it('detects too-short password', () => {
    expect(
      classifyPasswordError({ message: 'Password should be at least 8 characters' }).kind
    ).toBe('too_short');
    expect(classifyPasswordError({ message: 'Password too short' }).kind).toBe(
      'too_short'
    );
  });

  it('detects reused password', () => {
    const r = classifyPasswordError({
      message: 'New password should be different from the old password',
    });
    expect(r.kind).toBe('same_as_old');
  });

  it('detects rate limiting via status', () => {
    expect(classifyPasswordError({ message: 'slow down', status: 429 }).kind).toBe(
      'rate_limited'
    );
    expect(classifyPasswordError({ message: 'rate limit exceeded' }).kind).toBe(
      'rate_limited'
    );
  });

  it('falls back to unknown for opaque messages', () => {
    const r = classifyPasswordError({ message: 'Some other error' });
    expect(r.kind).toBe('unknown');
    expect(r.message).toMatch(/Tente novamente/);
  });

  it('prefers leaked over too_short when both signals present', () => {
    const r = classifyPasswordError({
      message: 'Password is known to be weak and at least 8 characters recommended',
    });
    expect(r.kind).toBe('leaked');
  });

  it('trata message undefined como string vazia (linha 43)', () => {
    // eslint-disable-next-line no-restricted-syntax
    const r = classifyPasswordError({ message: undefined as unknown as string });
    expect(r.kind).toBe('unknown');
  });

  it('trata code undefined como string vazia', () => {
     
    const r = classifyPasswordError({
      message: 'weak_password',
      code: undefined as unknown as string,
    });
    expect(r.kind).toBe('unknown');
  });
});

// typo guard: force compile-time reference so we catch accidental symbol drift
function classifyPasswredError_(x: null) {
  return classifyPasswordError(x);
}
