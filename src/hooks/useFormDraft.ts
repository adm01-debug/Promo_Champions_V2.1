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
  // JSON de referência por chave — "esta aba editou?". É o estado na
  // montagem ou o conteúdo recém-restaurado; `lastWriteRef` guarda o que
  // esta aba gravou por último.
  const baselineRef = useRef(new Map<string, string>());
  const lastWriteRef = useRef<string | null>(null);
  // Estado ainda não persistido — flush sem debounce quando a página sai
  // (pagehide/fechar aba) ou o componente desmonta (navegação interna).
  const pendingRef = useRef<{ key: string; state: T } | null>(null);

  useEffect(() => {
    // Restaura uma vez por chave — troca de chave (ex.: usuário carregou)
    // restaura o rascunho da nova chave.
    if (storageKey === null || restoredKeyRef.current === storageKey) return;
    restoredKeyRef.current = storageKey;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        // O conteúdo restaurado é a baseline: não conta como edição e uma
        // aba que só restaurou não cloba rascunho mais novo de outra aba.
        baselineRef.current.set(storageKey, raw);
        restoreRef.current(JSON.parse(raw) as T);
      }
    } catch {
      // Draft corrompido ou storage indisponível — ignora silenciosamente.
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey === null) {
      pendingRef.current = null;
      return;
    }
    // Baseline capturada no corpo do efeito (primeira render da chave),
    // não dentro do timer — lá o estado já pode incluir a primeira edição.
    if (!baselineRef.current.has(storageKey)) {
      baselineRef.current.set(storageKey, JSON.stringify(state));
    }
    pendingRef.current = { key: storageKey, state };
    const timer = setTimeout(() => {
      try {
        const json = JSON.stringify(state);
        const stored = localStorage.getItem(storageKey);
        // Uma aba que nunca editou (estado == baseline) não sobrescreve um
        // rascunho gravado por outra aba — sem isso, uma aba ociosa com o
        // form vazio apagava o trabalho da aba em edição.
        if (
          json === baselineRef.current.get(storageKey) &&
          stored !== null &&
          stored !== lastWriteRef.current
        ) {
          pendingRef.current = null;
          return;
        }
        localStorage.setItem(storageKey, json);
        lastWriteRef.current = json;
      } catch {
        // Quota excedida / modo privado — draft é best-effort.
      }
      pendingRef.current = null;
    }, 400);
    return () => clearTimeout(timer);
  }, [storageKey, state]);

  // O debounce não roda quando a página sai antes de 400ms — flush
  // imediato no pagehide/unload e na desmontagem (navegação interna).
  useEffect(() => {
    const flush = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;
      try {
        const json = JSON.stringify(pending.state);
        const stored = localStorage.getItem(pending.key);
        if (
          json === baselineRef.current.get(pending.key) &&
          stored !== null &&
          stored !== lastWriteRef.current
        ) {
          return;
        }
        localStorage.setItem(pending.key, json);
        lastWriteRef.current = json;
      } catch {
        // best-effort
      }
    };
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, []);

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
