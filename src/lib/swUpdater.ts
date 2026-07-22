/**
 * Service Worker updater: força verificação de nova versão e limpa caches
 * antigos ao abrir o app, sem exigir hard refresh do usuário.
 *
 * Em dev / preview do Lovable, o SW é destrutivamente desregistrado (kill switch)
 * para evitar que um SW antigo sirva bundles obsoletos e cause tela branca.
 */

const APP_SW_PATHS = ['/sw.js', '/pwa-sw.js', '/service-worker.js'];
const KILL_SWITCH_FLAG = 'promo-champions:sw-killed';

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

/**
 * Retorna true quando estamos rodando em contexto não-produção onde o SW
 * pode servir bundles obsoletos (dev local, preview do Lovable, iframe).
 */
const isNonProductionContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;

  const host = window.location.hostname;
  if (
    host.startsWith('id-preview--') ||
    host.startsWith('preview--') ||
    host === 'lovableproject.com' ||
    host.endsWith('.lovableproject.com') ||
    host === 'lovableproject-dev.com' ||
    host.endsWith('.lovableproject-dev.com')
  ) {
    return true;
  }

  try {
    if (window.self !== window.top) return true;
  } catch {
    // cross-origin frame — trata como preview
    return true;
  }

  return false;
};

/**
 * Kill switch: desregistra qualquer SW do app e limpa Cache Storage.
 * Idempotente por sessão via sessionStorage para evitar loops.
 */
const killAppServiceWorkers = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const alreadyRan = window.sessionStorage.getItem(KILL_SWITCH_FLAG) === '1';
    const registrations = await navigator.serviceWorker.getRegistrations();
    const appRegs = registrations.filter(reg => {
      const scriptUrl =
        reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? '';
      return APP_SW_PATHS.some(path => scriptUrl.endsWith(path));
    });

    if (appRegs.length === 0) {
      window.sessionStorage.setItem(KILL_SWITCH_FLAG, '1');
      return;
    }

    await Promise.all(appRegs.map(reg => reg.unregister().catch(() => false)));
    await clearAllCaches();
    window.sessionStorage.setItem(KILL_SWITCH_FLAG, '1');

    // Só recarrega uma vez por sessão para destravar bundles órfãos.
    if (!alreadyRan) window.location.reload();
  } catch {
    // Falhas de API do SW são silenciadas — kill switch é best-effort.
  }
};

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
 *
 * Em dev/preview, aciona o kill switch em vez de tentar atualizar o SW,
 * porque o /sw.js do Vite dev responde `text/html` e o registro falha,
 * deixando um SW antigo servindo bundles órfãos → tela branca.
 */
export const installSwAutoUpdate = (): void => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  if (isNonProductionContext()) {
    void killAppServiceWorkers();
    return;
  }

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

