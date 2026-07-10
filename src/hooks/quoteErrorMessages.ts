/**
 * Mensagens e códigos de erro do fluxo quote → sale.
 *
 * Extraído de `useQuotes.ts` para que os specs E2E (que rodam sob Node/Playwright,
 * sem `import.meta.env`) possam importar as mensagens sem puxar toda a chain do
 * cliente Supabase, que quebra fora do ambiente Vite.
 */
export type ConvertQuoteErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'QUOTE_NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_STATUS'
  | 'INVALID_TOTAL'
  | 'EMPTY_ITEMS'
  | 'TOTAL_MISMATCH'
  | 'UNKNOWN';

export const CONVERT_QUOTE_ERROR_MESSAGES: Record<ConvertQuoteErrorCode, string> = {
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  QUOTE_NOT_FOUND: 'Orçamento não encontrado.',
  FORBIDDEN: 'Você não tem permissão para converter este orçamento.',
  INVALID_STATUS: 'Orçamento precisa estar aprovado/aceito para virar venda.',
  INVALID_TOTAL: 'Valor total do orçamento inválido.',
  EMPTY_ITEMS: 'Orçamento sem itens não pode ser convertido em venda.',
  TOTAL_MISMATCH: 'Valor total não bate com a soma dos itens do orçamento.',
  UNKNOWN: 'Erro ao converter orçamento em venda.',
};

/** Extrai o código padronizado da mensagem `[CODE] ...` retornada pela RPC. */
export function parseConvertQuoteError(message: string): ConvertQuoteErrorCode {
  const match = /^\[([A-Z_]+)\]/.exec(message.trim());
  const code = match?.[1] as ConvertQuoteErrorCode | undefined;
  if (code && code in CONVERT_QUOTE_ERROR_MESSAGES) return code;
  return 'UNKNOWN';
}
