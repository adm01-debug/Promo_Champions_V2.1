import { z } from 'zod';
import type { Json } from '@/integrations/supabase/types';

/**
 * parseRows / parseRow — ponto único de conversão de resultados do Supabase
 * para tipos locais quando a query não é totalmente tipada:
 *   - selects customizados (joins, colunas calculadas ou renomeadas)
 *   - tabelas/views ainda ausentes do types.ts gerado
 *   - RPCs cujo `Returns` é Json/genérico
 *
 * Ordem de preferência:
 *   1. `supabase.from('tabela').select('*')` sem cast quando a tabela existe
 *      no types.ts gerado — o resultado já vem tipado como `Tables<'tabela'>`.
 *   2. `rowsWith(schema, data)` quando a forma é dinâmica — valida em runtime.
 *   3. `parseRows`/`parseRow` como último recurso documentado.
 *
 * NÃO reintroduzir `as unknown as T` nas chamadas: a regra
 * `no-restricted-syntax` do ESLint reprova o padrão.
 */
export function parseRows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export function parseRow<T>(data: unknown): T | null {
  return data === null || data === undefined ? null : (data as T);
}

/**
 * rowsWith — variante validada por schema zod para formas dinâmicas.
 * Lança erro quando a resposta não bate com o contrato esperado.
 */
export function rowsWith<S extends z.ZodType>(
  schema: S,
  data: unknown,
): z.output<S>[] {
  const parsed = z.array(schema).safeParse(data ?? []);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first ? first.path.join('.') : '';
    throw new Error(
      `rowsWith: resposta fora do schema esperado` +
        (where ? ` em '${where}'` : '') +
        ` (${parsed.error.issues.length} problema(s))`,
    );
  }
  return parsed.data;
}

/**
 * toJson — adapta um valor de domínio para uma coluna `Json` do PostgREST.
 * Preferível a `x as unknown as Json`: centraliza a única asserção
 * estruturalmente necessária (interfaces não têm index signature).
 */
export function toJson(value: unknown): Json {
  return value as Json;
}
