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
 *
 * `storageKey` pode ser `null` enquanto o contexto da chave não resolveu
 * (ex.: usuário ainda carregando): nesse estado o hook fica inerte — não
 * restaura nem persiste — para nunca gravar dados de uma conta sob uma
 * chave genérica/anon.
 */
export function useFormDraft<T>(
  storageKey: string | null,
  state: T,
  restore: (draft: T) => void
) {
  const restoredKeyRef = useRef<string | null>(null);
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  // JSON do estado na primeira render de cada chave: referência para saber
  // se ESTA aba editou algo. `lastWriteRef` guarda o que esta aba gravou.
  const mountJsonRef = useRef(new Map<string, string>());
  const lastWriteRef = useRef<string | null>(null);

  useEffect(() => {
    // Restaura uma vez por chave — troca de chave (ex.: usuário carregou)
    // restaura o rascunho da nova chave.
    if (storageKey === null || restoredKeyRef.current === storageKey) return;
    restoredKeyRef.current = storageKey;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) restoreRef.current(JSON.parse(raw) as T);
    } catch {
      // Draft corrompido ou storage indisponível — ignora silenciosamente.
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey === null) return;
    const timer = setTimeout(() => {
      try {
        const json = JSON.stringify(state);
        if (!mountJsonRef.current.has(storageKey)) {
          mountJsonRef.current.set(storageKey, json);
        }
        const stored = localStorage.getItem(storageKey);
        // Uma aba que nunca editou (estado == snapshot da montagem) não
        // sobrescreve um rascunho gravado por outra aba — sem isso, uma
        // aba ociosa com o form vazio apagava o trabalho da aba em edição.
        if (
          json === mountJsonRef.current.get(storageKey) &&
          stored !== null &&
          stored !== lastWriteRef.current
        ) {
          return;
        }
        localStorage.setItem(storageKey, json);
        lastWriteRef.current = json;
      } catch {
        // Quota excedida / modo privado — draft é best-effort.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [storageKey, state]);

  const clearDraft = useCallback(() => {
    if (storageKey === null) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // best-effort
    }
  }, [storageKey]);

  return { clearDraft };
}
