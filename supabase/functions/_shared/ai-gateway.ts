// URL do gateway de IA (Lovable AI Gateway) — ponto único de configuração.
// Para apontar outro gateway/proxy compatível com OpenAI, defina o env
// LOVABLE_AI_GATEWAY_URL no Supabase (ex.: "https://meu-gateway.exemplo.com").
const AI_GATEWAY_BASE =
  Deno.env.get('LOVABLE_AI_GATEWAY_URL')?.replace(/\/+$/, '') ??
  'https://ai.gateway.lovable.dev';

export const LOVABLE_AI_CHAT_COMPLETIONS_URL = `${AI_GATEWAY_BASE}/v1/chat/completions`;
export const LOVABLE_AI_EMBEDDINGS_URL = `${AI_GATEWAY_BASE}/v1/embeddings`;
