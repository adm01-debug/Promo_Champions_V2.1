// Ponto único de configuração dos endpoints de IA (OpenAI-compatíveis).
//
// Chat/completions aponta para o OpenRouter por padrão (endpoints OpenAI). Para
// mudar, defina o env OPENROUTER_BASE_URL (ex.: "https://openrouter.ai/api/v1").
// A chave de autenticação é o env LOVABLE_API_KEY (guarda o sk-or-... do OpenRouter).
const CHAT_BASE =
  Deno.env.get('OPENROUTER_BASE_URL')?.replace(/\/+$/, '') ??
  'https://openrouter.ai/api/v1';

// Embeddings permanecem em um gateway que os sirva: o OpenRouter não oferece
// endpoint de embeddings (verificado em runtime, 0 modelos), e trocar o modelo
// quebraria os índices vetoriais existentes. Mantém o gateway Lovable como
// default; mudar via LOVABLE_AI_GATEWAY_URL (ex.: outro provedor OpenAI).
const EMBED_BASE =
  Deno.env.get('LOVABLE_AI_GATEWAY_URL')?.replace(/\/+$/, '') ??
  'https://ai.gateway.lovable.dev';

export const LOVABLE_AI_CHAT_COMPLETIONS_URL = `${CHAT_BASE}/chat/completions`;
export const LOVABLE_AI_EMBEDDINGS_URL = `${EMBED_BASE}/v1/embeddings`;
