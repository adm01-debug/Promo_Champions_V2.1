/**
 * Migra um rascunho de formulário de uma chave legada para a chave atual,
 * sem destruir dados:
 * - destino com conteúdo real → preserva os dois ('kept');
 * - destino vazio (baseline gravado por visita sem edição) ou corrompido →
 *   o legado migra por cima ('migrated');
 * - sem legado → 'none'.
 *
 * A origem legada só é removida depois da cópia bem-sucedida.
 */
export function migrateLegacyDraft(
  legacyKey: string,
  newKey: string,
  destIsBaseline: (draft: {
    form?: Record<string, unknown>;
    items?: unknown[];
  }) => boolean,
  storage: Storage = localStorage
): 'migrated' | 'kept' | 'none' {
  try {
    const legacy = storage.getItem(legacyKey);
    if (legacy === null) return 'none';
    const existing = storage.getItem(newKey);
    if (existing !== null) {
      try {
        const dest = JSON.parse(existing) as {
          form?: Record<string, unknown>;
          items?: unknown[];
        };
        if (!destIsBaseline(dest)) return 'kept';
      } catch {
        // Destino corrompido — o legado migra por cima.
      }
    }
    storage.setItem(newKey, legacy);
    storage.removeItem(legacyKey);
    return 'migrated';
  } catch {
    return 'none';
  }
}
