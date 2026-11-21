// Ponto único de configuração dos endpoints de IA (OpenAI-compatíveis).
//
// Chat e embeddings apontam para o OpenRouter (endpoints OpenAI). Para mudar,
// defina o env OPENROUTER_BASE_URL (ex.: "https://openrouter.ai/api/v1").
// Ambos usam o env OPENROUTER_API_KEY (sk-or-...).
const CHAT_BASE =
  Deno.env.get('OPENROUTER_BASE_URL')?.replace(/\/+$/, '') ??
  'https://openrouter.ai/api/v1';

// O endpoint /embeddings do OpenRouter é válido e aceita "dimensions".
// EMBED_DIMENSIONS precisa casar com public.semantic_index.embedding vector(768):
// mudar a dimensão exige reindexação completa.
const EMBED_BASE =
  Deno.env.get('OPENROUTER_EMBEDDINGS_BASE_URL')?.replace(/\/+$/, '') ?? CHAT_BASE;

export const AI_EMBEDDING_MODEL =
  Deno.env.get('AI_EMBEDDING_MODEL') ?? 'openai/text-embedding-3-small';

export const AI_EMBEDDING_DIMENSIONS = 768;

export const LOVABLE_AI_CHAT_COMPLETIONS_URL = `${CHAT_BASE}/chat/completions`;
export const LOVABLE_AI_EMBEDDINGS_URL = `${EMBED_BASE}/embeddings`;
