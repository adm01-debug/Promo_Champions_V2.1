/**
 * Sufixo único para tópicos de canal realtime por mount.
 *
 * `crypto.randomUUID()` direto no `.channel()` quebra em contexto não-seguro
 * (http://, iframe sem secure context, webviews antigos), onde a API não
 * existe. O fallback Date.now + Math.random mantém o tópico único o bastante
 * para dedupe de canal — não é usado para segurança.
 */
export function uniqueChannelTopic(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}
