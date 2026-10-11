import { useEffect, useId, useRef } from 'react';
import { registerDirtySource, unregisterDirtySource } from '@/lib/navigationGuard';

/**
 * useFormGuard - Protege formulários com alterações não salvas.
 *
 * Cobertura:
 * - `beforeunload`: fechar/recarregar a aba (diálogo nativo do browser);
 * - navegação SPA interna: registra a página como "fonte suja" no
 *   navigationGuard, que intercepta links internos, o botão Voltar do app
 *   (useBackNavigation) e o Voltar do browser (popstate), exibindo o
 *   `NavigationGuardDialog` (AlertDialog) antes de sair.
 *
 * O projeto usa `<BrowserRouter>` clássico (sem data router), por isso o
 * bloqueio interno é feito pelo navigationGuard em vez de `useBlocker`.
 *
 * @param isDirty - Se o formulário possui alterações não salvas.
 * @param message - Mensagem exibida no diálogo de confirmação.
 */
export function useFormGuard(
  isDirty: boolean,
  message: string = 'Você tem alterações não salvas. Deseja realmente sair?'
) {
  const id = useId();
  const messageRef = useRef(message);
  messageRef.current = message;

  // Registro no guard de navegação interna.
  useEffect(() => {
    if (isDirty) {
      registerDirtySource(id, messageRef.current);
      return () => unregisterDirtySource(id);
    }
    return undefined;
  }, [isDirty, id]);

  // Diálogo nativo para fechar/recarregar a aba.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = messageRef.current;
        return messageRef.current;
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Mantém shape estável para consumidores existentes.
  return { state: 'unblocked' as const, proceed: () => {}, reset: () => {} };
}
