import { useCallback, useEffect, useRef } from 'react';

/**
 * useFormDraft — rascunho automático de formulário em localStorage.
 *
 * - Restaura o rascunho salvo uma única vez na montagem (via `restore`).
 * - Persiste `state` com debounce de 400ms a cada mudança.
 * - `clearDraft()` deve ser chamado após submit bem-sucedido.
 *
 * Genérico para qualquer estado serializável (ex.: { form, items } de um
 * formulário composto). Chave por página/contexto evita colisão.
 */
export function useFormDraft<T>(
  storageKey: string,
  state: T,
  restore: (draft: T) => void
) {
  const restoredKeyRef = useRef<string | null>(null);
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  useEffect(() => {
    // Restaura uma vez por chave — troca de chave (ex.: usuário carregou)
    // restaura o rascunho da nova chave.
    if (restoredKeyRef.current === storageKey) return;
    restoredKeyRef.current = storageKey;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) restoreRef.current(JSON.parse(raw) as T);
    } catch {
      // Draft corrompido ou storage indisponível — ignora silenciosamente.
    }
  }, [storageKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Quota excedida / modo privado — draft é best-effort.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [storageKey, state]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // best-effort
    }
  }, [storageKey]);

  return { clearDraft };
}
