/**
 * Guard global de navegação para formulários sujos.
 *
 * O projeto usa `<BrowserRouter>` declarativo (sem data router), então
 * `useBlocker` não existe. Este módulo implementa o equivalente:
 * - páginas registram estado "sujo" via `useFormGuard`;
 * - caminhos de saída cobertos:
 *   1. cliques em links internos (`<a href="/...">`) — captura no document;
 *   2. botão Voltar do app (`useBackNavigation`) — o `navigate(-1)` dispara
 *      popstate, interceptado aqui;
 *   3. Voltar do browser (popstate) — ao disparar com sujeira, re-empurramos
 *      a URL da página (o browser já popou) e perguntamos: confirma →
 *      `history.back()` de verdade; cancela → usuário segue na página;
 * - a confirmação visual fica em `NavigationGuardBridge` (AlertDialog),
 *   registrada via `setConfirmHandler` — sem `window.confirm` no fluxo SPA.
 */

type ConfirmHandler = (message: string) => Promise<boolean>;
type NavigateFn = (path: string) => void;

interface DirtySource {
  message: string;
}

const dirtySources = new Map<string, DirtySource>();
let confirmHandler: ConfirmHandler | null = null;
let navigateFn: NavigateFn | null = null;
let lastHref = typeof window !== 'undefined' ? window.location.href : '/';
let interceptingPop = false;

export function registerDirtySource(id: string, message: string) {
  dirtySources.set(id, { message });
}

export function unregisterDirtySource(id: string) {
  dirtySources.delete(id);
}

export function hasDirtySources(): boolean {
  return dirtySources.size > 0;
}

function firstDirtyMessage(): string {
  const first = dirtySources.values().next().value;
  return first?.message ?? 'Você tem alterações não salvas. Deseja realmente sair?';
}

export function setConfirmHandler(handler: ConfirmHandler | null) {
  confirmHandler = handler;
}

export function setNavigateFn(fn: NavigateFn | null) {
  navigateFn = fn;
}

/**
 * Chamado pela ponte React a cada troca de rota — mantém a URL da página
 * corrente para re-empurrá-la quando um pop é interceptado.
 */
export function setCurrentHref(href: string) {
  lastHref = href;
}

async function askConfirmation(): Promise<boolean> {
  return confirmHandler
    ? confirmHandler(firstDirtyMessage())
    : Promise.resolve(window.confirm(firstDirtyMessage()));
}

/**
 * Porta única de saída com verificação de estado sujo.
 * Se houver formulário sujo, pede confirmação antes de executar `action`.
 * Usada para navegações PUSH/REPLACE (links, fallback contextual) — saídas
 * por pop (navigate(-1), Voltar do browser) passam pelo listener de popstate.
 */
export async function requestNavigation(action: () => void) {
  if (!hasDirtySources()) {
    action();
    return;
  }
  if (await askConfirmation()) action();
}

/**
 * Intercepta pops de histórico (Voltar do browser, navigate(-1) do app).
 * O pop já aconteceu quando o evento dispara — então restauramos a página
 * via pushState e perguntamos. Instalado uma vez pelo NavigationGuardBridge.
 */
export function handlePopState() {
  if (!hasDirtySources() || interceptingPop) return;
  interceptingPop = true;
  // Volta para a página suja (a URL corrente já é a do destino do pop).
  // O state marcado evita que a restauração de scroll trate o re-push
  // como navegação nova e resete a posição do usuário.
  window.history.pushState({ __pcNavGuardRestore: true }, '', lastHref);
  void askConfirmation()
    .then(confirmed => {
      if (confirmed) {
        window.history.back(); // sai para o destino real do pop
      }
      // Cancelado: permanece na entrada re-empurrada (mesma página).
    })
    .finally(() => {
      interceptingPop = false;
    });
}

/**
 * Interceptação de cliques em links internos (capture phase).
 * Deve ser instalada uma única vez pelo `NavigationGuardBridge`.
 */
export function handleDocumentClick(event: MouseEvent) {
  if (!hasDirtySources()) return;
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target as HTMLElement | null;
  const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
  if (anchor.closest('[data-nav-guard-ignore]')) return;

  const href = anchor.getAttribute('href') ?? '';
  if (!href || href.startsWith('#')) return;

  // Só intercepta navegação interna (mesma origem / caminho relativo).
  const isInternal = href.startsWith('/') || anchor.origin === window.location.origin;
  if (!isInternal) return;

  const path = href.startsWith('/')
    ? href
    : `${anchor.pathname}${anchor.search}${anchor.hash}`;

  event.preventDefault();
  event.stopPropagation();
  void requestNavigation(() => {
    if (navigateFn) navigateFn(path);
    else window.location.assign(path);
  });
}
