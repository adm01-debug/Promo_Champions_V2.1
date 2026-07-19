import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRecoverableAssetError, recoverFromStaleAssetError, installStaleAssetRecovery } from './staleAssetRecovery';

const RECOVERY_ATTEMPT_KEY = 'promo-champions:asset-recovery-attempts';

// ---- helpers ----

function makeSessionStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    key: (_i: number) => null,
    get length() { return store.size; },
  };
}

// ---- isRecoverableAssetError ----

describe('isRecoverableAssetError', () => {
  it('recognizes failed dynamic import pattern', () => {
    expect(isRecoverableAssetError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
    expect(isRecoverableAssetError('failed to fetch dynamically imported module /assets/chunk.js')).toBe(true);
  });

  it('recognizes importing module script failed', () => {
    expect(isRecoverableAssetError(new Error('Importing a module script failed'))).toBe(true);
  });

  it('recognizes loading chunk errors', () => {
    expect(isRecoverableAssetError(new Error('Loading chunk 3 failed'))).toBe(true);
    expect(isRecoverableAssetError(new Error('ChunkLoadError: loading chunk 5 failed'))).toBe(true);
  });

  it('recognizes React initialization errors (case-insensitive)', () => {
    expect(isRecoverableAssetError(new Error("Cannot access 'React' before initialization"))).toBe(true);
    expect(isRecoverableAssetError(new Error("cannot access 'react' before initialization"))).toBe(true);
  });

  it('recognizes forwardRef undefined errors', () => {
    expect(isRecoverableAssetError(new Error("Cannot read properties of undefined (reading 'forwardRef')"))).toBe(true);
  });

  it('recognizes vendor-radix chunk errors', () => {
    expect(isRecoverableAssetError(new Error('vendor-radix-abc123.js failed to load'))).toBe(true);
  });

  it('does NOT flag generic errors as recoverable', () => {
    expect(isRecoverableAssetError(new Error('TypeError: Cannot read property foo'))).toBe(false);
    expect(isRecoverableAssetError(new Error('Network request failed'))).toBe(false);
    expect(isRecoverableAssetError(null)).toBe(false);
    expect(isRecoverableAssetError(undefined)).toBe(false);
    expect(isRecoverableAssetError(42)).toBe(false);
  });

  it('handles plain string errors', () => {
    expect(isRecoverableAssetError('chunkloaderror happened')).toBe(true);
    expect(isRecoverableAssetError('some unrelated string')).toBe(false);
  });

  it('handles objects via JSON stringify fallback', () => {
    expect(isRecoverableAssetError({ message: 'chunkloaderror' })).toBe(true);
    expect(isRecoverableAssetError({ code: 123 })).toBe(false);
  });
});

// ---- recoverFromStaleAssetError ----

describe('recoverFromStaleAssetError', () => {
  let locationReplaceSpy: ReturnType<typeof vi.fn>;
  let cacheDeleteSpy: ReturnType<typeof vi.fn>;
  let swGetRegistrationsSpy: ReturnType<typeof vi.fn>;
  let fakeSS: Storage;

  beforeEach(() => {
    fakeSS = makeSessionStorage();
    vi.stubGlobal('sessionStorage', fakeSS);

    locationReplaceSpy = vi.fn();
    vi.stubGlobal('location', {
      href: 'http://localhost:5173/test',
      replace: locationReplaceSpy,
    });

    // stub window.caches
    cacheDeleteSpy = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue([]),
      delete: cacheDeleteSpy,
    });

    // stub navigator.serviceWorker
    swGetRegistrationsSpy = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: { getRegistrations: swGetRegistrationsSpy },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing for non-recoverable errors', async () => {
    await recoverFromStaleAssetError(new Error('some random error'));
    expect(locationReplaceSpy).not.toHaveBeenCalled();
  });

  it('triggers location.replace for recoverable error on first attempt', async () => {
    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    expect(locationReplaceSpy).toHaveBeenCalledOnce();
    const url: string = locationReplaceSpy.mock.calls[0][0];
    expect(url).toContain('__asset_recovery=');
  });

  it('increments attempt counter in sessionStorage', async () => {
    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    const stored = fakeSS.getItem(RECOVERY_ATTEMPT_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.count).toBe(1);
    expect(typeof parsed.startedAt).toBe('number');
  });

  it('stops after MAX_RECOVERY_ATTEMPTS (2) within the window', async () => {
    fakeSS.setItem(
      RECOVERY_ATTEMPT_KEY,
      JSON.stringify({ count: 2, startedAt: Date.now() })
    );

    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    expect(locationReplaceSpy).not.toHaveBeenCalled();
  });

  it('resets counter after RECOVERY_WINDOW_MS (30s) has expired', async () => {
    const expired = Date.now() - 35_000;
    fakeSS.setItem(
      RECOVERY_ATTEMPT_KEY,
      JSON.stringify({ count: 2, startedAt: expired })
    );

    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    // window expired → attempt allowed → reload triggered
    expect(locationReplaceSpy).toHaveBeenCalledOnce();
  });

  it('deletes all caches when cache names are available', async () => {
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue(['api-cache', 'workbox-cache']),
      delete: cacheDeleteSpy,
    });

    await recoverFromStaleAssetError(new Error('chunkloaderror'));
    expect(cacheDeleteSpy).toHaveBeenCalledWith('api-cache');
    expect(cacheDeleteSpy).toHaveBeenCalledWith('workbox-cache');
  });

  it('unregisters service workers on recovery', async () => {
    const unregisterSpy = vi.fn().mockResolvedValue(true);
    swGetRegistrationsSpy.mockResolvedValue([{ unregister: unregisterSpy }]);

    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    expect(unregisterSpy).toHaveBeenCalledOnce();
  });

  it('handles sessionStorage write errors gracefully', async () => {
    const brokenSS = {
      ...makeSessionStorage(),
      setItem: () => { throw new Error('QuotaExceededError'); },
    };
    vi.stubGlobal('sessionStorage', brokenSS);

    // Should not throw; recovery still proceeds
    await expect(
      recoverFromStaleAssetError(new Error('Loading chunk 5 failed'))
    ).resolves.toBeUndefined();
  });

  it('handles malformed sessionStorage JSON gracefully (catch branch)', async () => {
    fakeSS.setItem(RECOVERY_ATTEMPT_KEY, 'not-valid-json{{{');

    // Should reset count to 0 (catch branch returns { count: 0 }) → recovery proceeds
    await recoverFromStaleAssetError(new Error('Loading chunk 5 failed'));
    expect(locationReplaceSpy).toHaveBeenCalledOnce();
  });
});

// ---- installStaleAssetRecovery ----

describe('installStaleAssetRecovery', () => {
  let fakeSS: Storage;
  let locationReplaceSpy: ReturnType<typeof vi.fn>;
  let addEventListenerSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fakeSS = makeSessionStorage();
    vi.stubGlobal('sessionStorage', fakeSS);

    locationReplaceSpy = vi.fn();
    vi.stubGlobal('location', {
      href: 'http://localhost:5173/',
      replace: locationReplaceSpy,
    });

    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
    });

    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: { getRegistrations: vi.fn().mockResolvedValue([]) },
    });

    addEventListenerSpy = vi.fn();
    vi.stubGlobal('window', {
      ...window,
      addEventListener: addEventListenerSpy,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('registers error and unhandledrejection listeners', () => {
    installStaleAssetRecovery();
    const eventNames = addEventListenerSpy.mock.calls.map((c: unknown[]) => c[0]);
    expect(eventNames).toContain('error');
    expect(eventNames).toContain('unhandledrejection');
  });
});
