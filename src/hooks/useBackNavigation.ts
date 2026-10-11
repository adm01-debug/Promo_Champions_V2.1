import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_TRAIL_KEY = 'app_nav_trail';
const TRAIL_LIMIT = 8;

const HOME_PATHS = new Set(['/', '/dashboard']);

/**
 * Caminho de fallback contextual: deriva a "página-mãe" da rota atual.
 * Último segmento que parece um identificador (uuid, número ou slug longo)
 * indica página de detalhe → sobe um nível. Caso contrário, tenta subir um
 * nível dentro de namespaces conhecidos (admin/*, configurações, etc.).
 * Sem correspondência, cai no dashboard.
 */
export function resolveBackFallback(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/dashboard';
  if (segments.length === 1) return '/dashboard';

  const last = segments[segments.length - 1];
  const looksLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(last) ||
    /^\d+$/.test(last) ||
    /^[0-9a-f]{16,}$/i.test(last);

  if (looksLikeId) {
    return `/${segments.slice(0, -1).join('/')}`;
  }

  // Namespaces com subpáginas administrativas → sobe para a raiz da seção.
  const sectionRoots = new Set(['admin', 'settings', 'configuracoes']);
  if (segments.length > 1 && sectionRoots.has(segments[0])) {
    return `/${segments[0]}`;
  }

  return '/dashboard';
}

function readTrail(): string[] {
  try {
    const raw = sessionStorage.getItem(NAV_TRAIL_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeTrail(trail: string[]) {
  try {
    sessionStorage.setItem(NAV_TRAIL_KEY, JSON.stringify(trail.slice(-TRAIL_LIMIT)));
  } catch {
    // sessionStorage indisponível (modo privado raro) — sem trail, sem loop-guard.
  }
}

function closeTopmostDialog(): boolean {
  const dialogs = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"]'
  );
  if (dialogs.length === 0) return false;
  const top = dialogs[dialogs.length - 1];
  const closeBtn = top.querySelector<HTMLElement>(
    'button[aria-label*="Close" i], button[aria-label*="Fechar" i], [data-dialog-close]'
  );
  if (closeBtn) {
    closeBtn.click();
    return true;
  }
  // Radix/feche-por-ESC: dispara keydown para o modal tratar.
  top.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  );
  return true;
}

interface BackNavigationOptions {
  /** Fallback explícito (ex.: lista da seção). Sobrescreve o fallback contextual. */
  fallbackPath?: string;
  /** Força voltar para a página-mãe mesmo com histórico de browser disponível. */
  preferParent?: boolean;
}

/**
 * Navegação "voltar" compartilhada (desktop + mobile):
 * - fecha o modal do topo em vez de ignorar o clique;
 * - detecta loops A→B→A no trail de sessão e sobe para a página-mãe;
 * - usa navigate(-1) quando há histórico real; senão, fallback contextual
 *   (resolveBackFallback) ou o fallbackPath passado pelo chamador.
 */
export function useBackNavigation(options?: BackNavigationOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const isHomePage = HOME_PATHS.has(pathname);
  const fallback = options?.fallbackPath ?? resolveBackFallback(pathname);

  const goBack = useCallback(() => {
    // 1) Modal aberta ganha: fecha o modal do topo, não navega.
    if (closeTopmostDialog()) return;

    // 2) Loop-guard: trail termina em A→B→A (o -1 voltaria para B, que
    //    levaria de volta a A). Sobe para a página-mãe.
    const trail = readTrail();
    if (
      trail.length >= 3 &&
      trail[trail.length - 1] === pathname &&
      trail[trail.length - 3] === pathname
    ) {
      navigate(fallback, { replace: true });
      return;
    }

    // 3) Histórico real do browser → voltar; senão, fallback contextual.
    if (window.history.length > 2 && !options?.preferParent) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, pathname, fallback, options?.preferParent]);

  return { goBack, isHomePage, fallback };
}

/**
 * Registra o path atual no trail de sessão — chamado pelo MainLayout a cada
 * mudança de rota (mantido fora do hook para registrar uma única vez por rota).
 */
export function recordNavTrail(pathname: string) {
  const trail = readTrail();
  if (trail[trail.length - 1] !== pathname) {
    trail.push(pathname);
    writeTrail(trail);
  }
}
