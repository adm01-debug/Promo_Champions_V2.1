import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestNavigation } from '@/lib/navigationGuard';
import { trackInteraction } from '@/lib/analytics';

const HOME_PATHS = new Set(['/', '/dashboard']);

/**
 * Rotas de detalhe cujo caminho-mãe não é o prefixo da rota.
 * Derivado de AppRoutes.tsx: padrões `/:param` cujo prefixo não existe
 * como rota de listagem (ex.: `/vendedor/:id` → lista é `/vendedores`).
 */
const PARENT_OVERRIDES: Record<string, string> = {
  '/vendedor': '/vendedores',
  '/meus-pedidos': '/acompanhamento-pedidos',
  '/race-arena/spectator': '/race-arena',
};

/**
 * Caminho de fallback contextual: deriva a "página-mãe" da rota atual.
 * Último segmento que parece um identificador (uuid, número ou slug longo)
 * indica página de detalhe → sobe um nível (via PARENT_OVERRIDES quando o
 * prefixo não é rota válida). Caso contrário, tenta subir um nível dentro
 * de namespaces conhecidos (admin/*, settings/*). Sem correspondência,
 * cai no dashboard.
 */
export function resolveBackFallback(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/dashboard';
  if (segments.length === 1) return '/dashboard';

  const last = segments[segments.length - 1];
  if (!last) return '/dashboard';
  const looksLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(last) ||
    /^\d+$/.test(last) ||
    /^[0-9a-f]{16,}$/i.test(last);

  if (looksLikeId) {
    const parent = `/${segments.slice(0, -1).join('/')}`;
    return PARENT_OVERRIDES[parent] ?? parent;
  }

  // Namespaces com subpáginas administrativas → sobe para a raiz da seção.
  const sectionRoots = new Set(['admin', 'settings', 'configuracoes']);
  const root = segments[0];
  if (segments.length > 1 && root && sectionRoots.has(root)) {
    return `/${root}`;
  }

  return '/dashboard';
}

/** Seletor de modais Radix/shadcn — usado pelo guard do atalho Esc também. */
const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';

function closeTopmostDialog(): boolean {
  const dialogs = document.querySelectorAll<HTMLElement>(DIALOG_SELECTOR);
  if (dialogs.length === 0) return false;
  const top = dialogs[dialogs.length - 1];
  if (!top) return false;
  const closeBtn = top.querySelector<HTMLElement>(
    'button[aria-label*="Close" i], button[aria-label*="Fechar" i], [data-dialog-close]'
  );
  if (closeBtn) {
    closeBtn.click();
    return true;
  }
  // Radix DismissableLayer escuta Escape no document; o evento sintético
  // borbulha até lá e fecha o modal. O listener global de teclado ignora
  // Escape enquanto houver dialog aberto — sem recursão.
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

/** Há modal/dialog aberto no momento? (exportado para guards de atalho) */
export function hasOpenDialog(): boolean {
  return document.querySelectorAll(DIALOG_SELECTOR).length > 0;
}

/**
 * Navegação "voltar" compartilhada (desktop + mobile):
 * - fecha o modal do topo em vez de ignorar o clique;
 * - usa navigate(-1) quando há histórico real; senão, fallback contextual
 *   (resolveBackFallback) ou o fallbackPath passado pelo chamador.
 */
export function useBackNavigation(options?: BackNavigationOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const isHomePage = HOME_PATHS.has(pathname);
  const fallback = options?.fallbackPath ?? resolveBackFallback(pathname);
  // A entrada atual foi criada por um voltar-fallback anterior? Sem esta
  // marca, deep-link → detalhe → voltar (fallback p/ lista) → voltar de
  // novo faria navigate(-1) de volta ao detalhe — loop A→B→A. Com ela,
  // o voltar continua subindo (lista → dashboard).
  const arrivedViaFallback = Boolean(
    (location.state as Record<string, unknown> | null)?.__pcBackFallback
  );

  const goBack = useCallback(() => {
    // Modal aberta ganha: fecha o modal do topo, não navega.
    if (closeTopmostDialog()) return;

    // Telemetria: contabiliza uso do voltar na página de origem
    // (flush acontece na saída da página, no RouteTracker).
    trackInteraction();

    if (window.history.length > 2 && !options?.preferParent && !arrivedViaFallback) {
      // Formulário sujo: o navigate(-1) dispara popstate, interceptado
      // pelo navigationGuard (pushState de retorno + confirmação).
      navigate(-1);
    } else {
      // Fallback é PUSH/REPLACE — não passa por popstate; guarda aqui.
      // A entrada criada é marcada para o próximo voltar continuar subindo.
      void requestNavigation(() =>
        navigate(fallback, { replace: true, state: { __pcBackFallback: true } })
      );
    }
  }, [navigate, fallback, options?.preferParent, arrivedViaFallback]);

  return { goBack, isHomePage, fallback };
}
