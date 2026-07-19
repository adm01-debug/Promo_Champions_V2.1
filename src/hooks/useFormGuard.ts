import { useEffect } from 'react';

/**
 * useFormGuard - Avisa o usuário antes de fechar/recarregar a aba com alterações não salvas.
 *
 * Observação: `useBlocker` do react-router-dom exige um data router
 * (`createBrowserRouter`). O projeto usa `<BrowserRouter>` clássico, portanto
 * o bloqueio de navegação SPA foi removido para eliminar o erro
 * "useBlocker must be used within a data router". A proteção via
 * `beforeunload` (fechar/recarregar aba) continua ativa e cobre o caso crítico
 * de perda de dados. Diálogos de confirmação em navegação interna devem ser
 * implementados pontualmente no componente (ex.: interceptar clique/close).
 *
 * @param isDirty - Se o formulário possui alterações não salvas.
 * @param message - Mensagem exibida no diálogo do navegador (a maioria dos
 *                  browsers modernos mostra um texto genérico).
 */
export function useFormGuard(
  isDirty: boolean,
  message: string = 'Você tem alterações não salvas. Deseja realmente sair?'
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // Mantém shape estável para consumidores existentes.
  return { state: 'unblocked' as const, proceed: () => {}, reset: () => {} };
}
