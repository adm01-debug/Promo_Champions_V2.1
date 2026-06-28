/**
 * Service Worker updater: força verificação de nova versão e limpa caches
 * antigos ao abrir o app, sem exigir hard refresh do usuário.
 */

const APP_SW_PATHS = ['/sw.js', '/pwa-sw.js', '/service-worker.js'];

const clearAllCaches = async (): Promise<void> => {
  if (!('caches' in window)) return;
  const names = await window.caches.keys();
  await Promise.all(names.map(name => window.caches.delete(name)));
};

const waitForActivation = (worker: ServiceWorker): Promise<void> =>
  new Promise(resolve => {
    if (worker.state === 'activated') return resolve();
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve();
    });
  });

export interface RefreshSwOptions {
  /** Recarrega a página automaticamente após ativar o novo SW. */
  reload?: boolean;
  /** Limpa todos os caches (Cache Storage) além de atualizar o SW. */
  clearCaches?: boolean;
}

/**
 * Dispara update() em todos os registros de SW do app, ativa o waiting
 * via SKIP_WAITING e opcionalmente limpa caches/recarrega a página.
 * Retorna true se algum SW foi atualizado ou cache limpo.
 */
export const refreshServiceWorker = async (
  options: RefreshSwOptions = {}
): Promise<boolean> => {
  const { reload = false, clearCaches = true } = options;

  if (typeof window === 'undefined') return false;

  let didUpdate = false;

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const appRegistrations = registrations.filter(reg => {
        const scriptUrl = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? '';
        return APP_SW_PATHS.some(path => scriptUrl.endsWith(path));
      });

      await Promise.all(
        appRegistrations.map(async reg => {
          await reg.update().catch(() => undefined);

          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            await waitForActivation(reg.waiting);
            didUpdate = true;
          }
        })
      );
    } catch {
      // Ignore — SW APIs podem falhar em contextos restritos.
    }
  }

  if (clearCaches) {
    await clearAllCaches();
    didUpdate = true;
  }

  if (reload && didUpdate) {
    window.location.reload();
  }

  return didUpdate;
};

/**
 * Instala um listener que dispara refreshServiceWorker() sempre que o app
 * ganha foco (abertura/retomada da aba), garantindo bundles e caches frescos
 * sem necessidade de hard refresh.
 */
export const installSwAutoUpdate = (): void => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  // Dispara assim que o app abre.
  void refreshServiceWorker({ reload: false, clearCaches: false });

  // Re-checa quando a aba volta a ficar visível.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void refreshServiceWorker({ reload: false, clearCaches: false });
    }
  });

  // Recarrega automaticamente quando um novo SW assume o controle.
  let hasReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  });
};
