const RECOVERY_ATTEMPT_KEY = 'promo-champions:asset-recovery-attempts';
const RECOVERY_WINDOW_MS = 30_000;
const MAX_RECOVERY_ATTEMPTS = 2;

const RECOVERABLE_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'loading chunk',
  'chunkloaderror',
  "cannot access 'react' before initialization",
  "cannot read properties of undefined (reading 'forwardref')",
  'vendor-radix-',
];

interface RecoveryAttemptState {
  count: number;
  startedAt: number;
}

const readAttemptState = (): RecoveryAttemptState => {
  try {
    const rawValue = window.sessionStorage.getItem(RECOVERY_ATTEMPT_KEY);
    if (!rawValue) return { count: 0, startedAt: Date.now() };

    const parsed = JSON.parse(rawValue) as Partial<RecoveryAttemptState>;
    const startedAt = typeof parsed.startedAt === 'number' ? parsed.startedAt : Date.now();
    const isExpired = Date.now() - startedAt > RECOVERY_WINDOW_MS;

    if (isExpired) return { count: 0, startedAt: Date.now() };

    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      startedAt,
    };
  } catch {
    return { count: 0, startedAt: Date.now() };
  }
};

const writeAttemptState = (state: RecoveryAttemptState): void => {
  try {
    window.sessionStorage.setItem(RECOVERY_ATTEMPT_KEY, JSON.stringify(state));
  } catch {
    // Session storage may be unavailable in restricted browser modes.
  }
};

const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name} ${error.message} ${error.stack ?? ''}`.toLowerCase();
  }

  if (typeof error === 'string') return error.toLowerCase();

  try {
    return JSON.stringify(error).toLowerCase();
  } catch {
    return String(error).toLowerCase();
  }
};

export const isRecoverableAssetError = (error: unknown): boolean => {
  const errorText = stringifyError(error);
  return RECOVERABLE_ERROR_PATTERNS.some(pattern => errorText.includes(pattern));
};

const clearCaches = async (): Promise<void> => {
  if (!('caches' in window)) return;

  const cacheNames = await window.caches.keys();
  await Promise.all(cacheNames.map(cacheName => window.caches.delete(cacheName)));
};

const unregisterServiceWorkers = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));
};

export const recoverFromStaleAssetError = async (error: unknown): Promise<void> => {
  if (!isRecoverableAssetError(error)) return;

  const currentState = readAttemptState();
  if (currentState.count >= MAX_RECOVERY_ATTEMPTS) return;

  writeAttemptState({
    count: currentState.count + 1,
    startedAt: currentState.startedAt,
  });

  await Promise.allSettled([clearCaches(), unregisterServiceWorkers()]);

  const recoveryUrl = new URL(window.location.href);
  recoveryUrl.searchParams.set('__asset_recovery', String(Date.now()));
  window.location.replace(recoveryUrl.toString());
};

export const installStaleAssetRecovery = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', event => {
    void recoverFromStaleAssetError(event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', event => {
    void recoverFromStaleAssetError(event.reason);
  });
};