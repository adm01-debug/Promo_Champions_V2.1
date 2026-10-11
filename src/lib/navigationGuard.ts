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
 *   3. Voltar/Avançar do browser (popstate) — ao disparar com sujeira,
 *      re-empurramos a página via `navigate` PUSH e ressincronizamos o
 *      Router no mesmo lote (a página suja nunca desmonta);
 *      confirma → `navigate(replace)` para o destino real do pop;
 *      cancela → usuário já está de volta à página;
 * - a confirmação visual fica em `NavigationGuardBridge` (AlertDialog),
 *   registrada via `setConfirmHandler` — sem `window.confirm` no fluxo SPA.
 */

type ConfirmHandler = (message: string) => Promise<boolean>;
type NavigateFn = (
  path: string,
  options?: { replace?: boolean; state?: unknown }
) => void;

interface DirtySource {
  message: string;
}

const dirtySources = new Map<string, DirtySource>();
let confirmHandler: ConfirmHandler | null = null;
let navigateFn: NavigateFn | null = null;
let lastHref = typeof window !== 'undefined' ? window.location.href : '/';
let askingConfirmation = false;
let pendingDestination: string | null = null;

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
 * Intercepta pops de histórico (Voltar/Avançar do browser, navigate(-1)).
 * O pop já aconteceu quando o evento dispara: o browser está no destino e
 * o React Router vai renderizá-lo. Re-empurramos a URL da página suja e
 * ressincronizamos o Router com `navigate(lastHref, replace)` no mesmo lote
 * de render — assim a página suja nunca desmonta, independente da ordem em
 * que os listeners de popstate rodam. Confirmado, navegamos para o destino
 * real do pop (funciona para Voltar e Avançar, sem `history.back()` — que
 * dispararia outro popstate e re-cairia na confirmação).
 */
export function handlePopState() {
  if (!hasDirtySources() || !navigateFn) return;
  // Destino real do pop — o último vence em pops repetidos durante o diálogo.
  pendingDestination = window.location.href;
  // Reempurra a página suja via navigate PUSH (preserva a entrada anterior
  // na pilha e mantém o índice interno do Router consistente — pushState
  // manual o corromperia). O state marcado evita que a restauração de
  // scroll trate o re-push como navegação nova.
  navigateFn(lastHref, {
    replace: false,
    state: { __pcNavGuardRestore: true },
  });
  if (askingConfirmation) return;
  askingConfirmation = true;
  void askConfirmation()
    .then(confirmed => {
      const destination = pendingDestination;
      pendingDestination = null;
      // Substituir a entrada de restauração mantém a pilha limpa:
      // confirma → [anterior, destino]; cancela → já estamos na página suja.
      if (confirmed && destination) navigateFn?.(destination, { replace: true });
    })
    .finally(() => {
      askingConfirmation = false;
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
