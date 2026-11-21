import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { isAuthorizedCronRequest } from "../_shared/cron-request-auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import {
  AI_EMBEDDING_DIMENSIONS,
  AI_EMBEDDING_MODEL,
  LOVABLE_AI_EMBEDDINGS_URL,
} from "../_shared/ai-gateway.ts";
import {
  buildSemanticContent,
  SEMANTIC_TABLE_BY_TYPE as TABLE_BY_TYPE,
  sha256HexText,
  type SemanticEntityType as EntityType,
} from "../_shared/semantic-content.ts";

interface BatchRequest {
  entity_types?: EntityType[];
  only_missing?: boolean;
  batch_size?: number;
  concurrency?: number;
}

const DEFAULT_TYPES: EntityType[] = ["client", "lead", "deal", "activity", "call_recording"];

/** Tamanho do lote enviado por request ao endpoint de embeddings. */
const EMBED_CHUNK = 50;
/** Pagina de leitura das tabelas de origem (evita payload enorme por request). */
const PAGE_SIZE = 200;

async function pMap<T, R>(items: T[], concurrency: number, fn: (it: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { results[idx] = await fn(items[idx]); } catch { /* registrado pelo chamador */ }
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Gera embeddings para um lote de textos numa unica chamada ao provider.
 * O endpoint aceita array de input e devolve `data[i].index`, o que reduz
 * drasticamente o numero de requests (e o custo/latencia) na reindexacao.
 */
async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const payload = JSON.stringify({
    model: AI_EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
    dimensions: AI_EMBEDDING_DIMENSIONS,
  });
  let res: Response | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetchWithTimeout(LOVABLE_AI_EMBEDDINGS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: payload,
    }, 120_000);
    if (res.ok || (res.status !== 429 && res.status < 500)) break;
    await res.body?.cancel();
    await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
  }
  if (!res || !res.ok) {
    throw new Error(`Embedding error ${res?.status ?? "network"}: ${await res?.text() ?? ""}`);
  }
  const json = await res.json();
  const data = json?.data as Array<{ index?: number; embedding: number[] }> | undefined;
  if (!Array.isArray(data) || data.length !== texts.length) {
    throw new Error(`Invalid embedding batch response (${data?.length ?? 0} of ${texts.length})`);
  }
  const ordered: number[][] = new Array(texts.length);
  data.forEach((d, pos) => {
    if (!Array.isArray(d.embedding) || d.embedding.length !== AI_EMBEDDING_DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch: ${d.embedding?.length} != ${AI_EMBEDDING_DIMENSIONS}`);
    }
    ordered[d.index ?? pos] = d.embedding;
  });
  return ordered;
}

Deno.serve(withRequestId("semantic-reindex-batch", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isCron = await isAuthorizedCronRequest(req, async () => {
      const { data, error } = await admin
        .from("_internal_secrets")
        .select("value")
        .eq("key", "coaching_cron_secret")
        .maybeSingle();
      if (error) throw error;
      return (data as { value?: string | null } | null)?.value ?? null;
    });

    if (!isCron) {
      const auth = req.headers.get("Authorization");
      if (!auth) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: auth } } },
      );
      const { data: u } = await userClient.auth.getUser();
      if (!u?.user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await userClient.rpc("is_admin_or_manager", { _user_id: u.user.id });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "admin/manager only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = (await req.json().catch(() => ({}))) as BatchRequest;
    const types = (body.entity_types && body.entity_types.length > 0 ? body.entity_types : DEFAULT_TYPES)
      .filter((t) => TABLE_BY_TYPE[t]);
    const onlyMissing = body.only_missing !== false;
    const batchSize = Math.min(Math.max(1, body.batch_size ?? 100), 2000);
    const concurrency = Math.min(Math.max(1, body.concurrency ?? 4), 8);

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

    const summary: Record<string, {
      indexed: number;
      skipped: number;
      failed: number;
      total_candidates: number;
      errors?: string[];
    }> = {};

    for (const t of types) {
      const cfg = TABLE_BY_TYPE[t];
      const errors: string[] = [];
      let indexed = 0;
      let skipped = 0;
      let failed = 0;
      let seen = 0;
      let offset = 0;

      // Avanca paginas enquanto ainda houver o que indexar: linhas ja indexadas
      // sao puladas pelo hash, entao uma varredura completa converge para o fim
      // da tabela em vez de reprocessar sempre as N mais recentes.
      while (indexed < batchSize) {
        const take = PAGE_SIZE;
        let q = admin
          .from(cfg.table)
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + take - 1);
        if (cfg.statusFilter) q = q.in("status", cfg.statusFilter);

        const { data: rows, error: rowsErr } = await q;
        if (rowsErr) {
          // tabela pode nao existir neste projeto - pula sem quebrar o lote
          errors.push(`select ${cfg.table}: ${rowsErr.message}`);
          break;
        }
        const page = (rows ?? []) as Array<Record<string, unknown>>;
        if (page.length === 0) break;
        offset += page.length;
        seen += page.length;

        // Monta conteudo + hash e descarta o que nao mudou.
        const candidates: Array<{
          id: string;
          content: string;
          hash: string;
          salespersonId: string | null;
          sourceUpdatedAt: string | null;
        }> = [];
        for (const row of page) {
          const id = row.id as string;
          const content = buildSemanticContent(t, row).trim();
          if (!content) { skipped++; continue; }
          candidates.push({
            id,
            content,
            hash: await sha256HexText(content),
            salespersonId: cfg.ownerCol ? ((row[cfg.ownerCol] as string | null) ?? null) : null,
            sourceUpdatedAt:
              (row.updated_at as string | undefined) ??
              (row.created_at as string | undefined) ??
              null,
          });
        }

        let targets = candidates;
        if (onlyMissing && candidates.length > 0) {
          const existing = await chunkedIn<{ entity_id: string; content_hash: string | null }>(
            candidates.map((c) => c.id),
            (chunk) =>
              admin
                .from("semantic_index")
                .select("entity_id, content_hash")
                .eq("entity_type", t)
                .in("entity_id", chunk),
            { parallel: true, label: `semantic-reindex-batch.${t}` },
          );
          const hashById = new Map(existing.map((r) => [r.entity_id, r.content_hash]));
          targets = candidates.filter((c) => hashById.get(c.id) !== c.hash);
          skipped += candidates.length - targets.length;
        }

        // Gera embeddings em lote e grava em paralelo.
        const chunks: Array<typeof targets> = [];
        for (let i = 0; i < targets.length; i += EMBED_CHUNK) {
          chunks.push(targets.slice(i, i + EMBED_CHUNK));
        }

        await pMap(chunks, Math.max(1, Math.min(concurrency, 3)), async (chunk) => {
          let embeddings: number[][];
          try {
            embeddings = await embedBatch(chunk.map((c) => c.content), apiKey);
          } catch (e) {
            failed += chunk.length;
            if (errors.length < 3) errors.push(e instanceof Error ? e.message : String(e));
            return;
          }
          await Promise.all(chunk.map(async (c, pos) => {
            const { error: upErr } = await admin.rpc("upsert_semantic_entry", {
              _entity_type: t,
              _entity_id: c.id,
              _salesperson_id: c.salespersonId,
              _content: c.content,
              _embedding: embeddings[pos] as unknown as string,
              _metadata: { indexed_at: new Date().toISOString(), source: "reindex-batch" },
            });
            if (upErr) {
              failed++;
              if (errors.length < 3) errors.push(`upsert ${c.id}: ${upErr.message}`);
              return;
            }
            const { error: metaErr } = await admin
              .from("semantic_index")
              .update({ content_hash: c.hash, source_updated_at: c.sourceUpdatedAt })
              .eq("entity_type", t)
              .eq("entity_id", c.id);
            if (metaErr) {
              if (errors.length < 3) errors.push(`meta ${c.id}: ${metaErr.message}`);
            }
            indexed++;
          }));
        });
      }

      summary[t] = {
        indexed,
        skipped,
        failed,
        total_candidates: seen,
        ...(errors.length ? { errors } : {}),
      };
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-reindex-batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));