import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  validateUUID,
  validateEnum,
  collectErrors,
  validationErrorResponse,
} from '../_shared/validation.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import { enforceRateLimit } from '../_shared/rate-limit.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';
import { isInternalServiceRequest } from '../_shared/internal-service-auth.ts';
import {
  buildSemanticContent,
  SEMANTIC_TABLE_BY_TYPE,
  sha256HexText,
  type SemanticEntityType,
} from '../_shared/semantic-content.ts';
import {
  AI_EMBEDDING_DIMENSIONS,
  AI_EMBEDDING_MODEL,
  LOVABLE_AI_EMBEDDINGS_URL,
} from '../_shared/ai-gateway.ts';

interface IndexRequest {
  entity_type: SemanticEntityType;
  entity_id: string;
  force?: boolean;
}

const TABLE_BY_TYPE = SEMANTIC_TABLE_BY_TYPE;
type EntityType = SemanticEntityType;

function buildContent(type: EntityType, row: Record<string, unknown>): string {
  return buildSemanticContent(type, row);
}

async function sha256Hex(text: string): Promise<string> {
  return sha256HexText(text);
}
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const payload = JSON.stringify({
    model: AI_EMBEDDING_MODEL,
    input: text.slice(0, 8000),
    dimensions: AI_EMBEDDING_DIMENSIONS,
  });
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetchWithTimeout(LOVABLE_AI_EMBEDDINGS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    // 429/5xx em reindexação em lote é transitório (limite de taxa do provider).
    if (res.ok || (res.status !== 429 && res.status < 500)) break;
    await res.body?.cancel();
    await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
  }
  if (!res || !res.ok) {
    throw new Error(`Embedding error ${res?.status ?? 'network'}: ${await res?.text() ?? ''}`);
  }
  const json = await res.json();
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error('Invalid embedding response');
  if (emb.length !== AI_EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding dimension mismatch: ${emb.length} != ${AI_EMBEDDING_DIMENSIONS}`);
  }
  return emb;
}

const VALID_ENTITY_TYPES = Object.keys(TABLE_BY_TYPE) as EntityType[];

Deno.serve(
  withRequestId('semantic-index-entity', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // Rate limit por IP — endpoint de IA consome créditos. Chamadas internas
    // (service_role, ex.: semantic-reindex-batch) partem sempre do mesmo IP do
    // worker e seriam bloqueadas em massa; para elas a cadência já é controlada
    // pelo `concurrency` do batch.
    if (!isInternalServiceRequest(req)) {
      const rl = enforceRateLimit(req, {
        name: 'semantic-index-entity',
        limit: 20,
        windowSeconds: 60,
      });
      if (rl) return rl;
    }

    try {
      // Autorização: chamada interna (service_role) ou usuário autenticado.
      if (!isInternalServiceRequest(req)) {
        try {
          await getUserClient(req);
        } catch (error) {
          if (error instanceof UnauthorizedError) {
            return new Response(JSON.stringify({ error: 'unauthorized' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          console.error('semantic-index-entity authorization failed:', error);
          return new Response(JSON.stringify({ error: 'authorization_unavailable' }), {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const {
        entity_type,
        entity_id,
        force = false,
      } = (await req.json()) as IndexRequest;

      const errs = collectErrors([
        validateEnum(entity_type, 'entity_type', VALID_ENTITY_TYPES, true),
        validateUUID(entity_id, 'entity_id', true),
      ]);
      if (errs.length) return validationErrorResponse(errs, corsHeaders);

      const apiKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const cfg = TABLE_BY_TYPE[entity_type];
      const { data: row, error: rowErr } = await supabase
        .from(cfg.table)
        .select('*')
        .eq('id', entity_id)
        .maybeSingle();
      if (rowErr) throw rowErr;
      if (!row) {
        return new Response(JSON.stringify({ error: 'entity not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const content = buildContent(entity_type, row).trim();
      if (!content) {
        return new Response(JSON.stringify({ skipped: true, reason: 'empty content' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const contentHash = await sha256Hex(content);
      const sourceUpdatedAt =
        (row.updated_at as string | undefined) ??
        (row.created_at as string | undefined) ??
        null;

      // Skip if hash unchanged (and not forced)
      if (!force) {
        const { data: existing } = await supabase
          .from('semantic_index')
          .select('content_hash, source_updated_at')
          .eq('entity_type', entity_type)
          .eq('entity_id', entity_id)
          .maybeSingle();
        if (existing && existing.content_hash === contentHash) {
          return new Response(
            JSON.stringify({
              skipped: true,
              reason: 'unchanged',
              content_hash: contentHash,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      let salesperson_id: string | null = cfg.ownerCol
        ? ((row[cfg.ownerCol] as string | null) ?? null)
        : null;
      if (entity_type === 'client' && !salesperson_id) {
        const { data: cp } = await supabase
          .from('client_portfolio')
          .select('salesperson_id')
          .eq('client_id', entity_id)
          .maybeSingle();
        salesperson_id = cp?.salesperson_id ?? null;
      }

      const embedding = await generateEmbedding(content, apiKey);

      const { data: upsertId, error: upErr } = await supabase.rpc(
        'upsert_semantic_entry',
        {
          _entity_type: entity_type,
          _entity_id: entity_id,
          _salesperson_id: salesperson_id,
          _content: content,
          _embedding: embedding as unknown as string,
          _metadata: { indexed_at: new Date().toISOString() },
        }
      );
      if (upErr) throw upErr;

      // Update freshness columns separately (RPC doesn't accept them)
      await supabase
        .from('semantic_index')
        .update({
          content_hash: contentHash,
          source_updated_at: sourceUpdatedAt,
        })
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id);

      return new Response(
        JSON.stringify({
          ok: true,
          id: upsertId,
          content_preview: content.slice(0, 120),
          content_hash: contentHash,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (e) {
      console.error('semantic-index-entity error:', e);
      return new Response(
        JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  })
);
