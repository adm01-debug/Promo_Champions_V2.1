// Worker da fila de ingestão de call_recordings (Entrega 3/4).
// - Dispara periodicamente (pg_cron) ou sob demanda (POST autenticado com role service).
// - Reserva jobs com FOR UPDATE SKIP LOCKED (via RPC dequeue_call_recording_ingest_jobs).
// - Insere em call_recordings com ON CONFLICT DO NOTHING para nunca duplicar.
// - Marca sucesso; em falha, agenda retry com backoff exponencial (via RPC).
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";

interface JobPayload {
  id: string;                 // recording_id (também PK em call_recordings)
  salesperson_id: string;
  sale_id?: string | null;
  client_id?: string | null;
  title: string;
  audio_url: string;
  duration_seconds?: number | null;
  metadata?: Record<string, unknown> | null;
  status?: string;            // default 'ready'
  participants?: unknown;
}

interface JobRow {
  id: string;
  idempotency_key: string;
  recording_id: string;
  salesperson_id: string;
  payload: JobPayload;
  attempts: number;
  max_attempts: number;
}

const WORKER_ID = `edge-${crypto.randomUUID().slice(0, 8)}`;
const BATCH_SIZE = 20;

Deno.serve(withRequestId("process-call-recording-ingest", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const startedAt = Date.now();
  let processed = 0, succeeded = 0, failed = 0, dedup = 0;

  const { data: jobs, error: dqErr } = await admin.rpc(
    "dequeue_call_recording_ingest_jobs",
    { _batch_size: BATCH_SIZE, _worker_id: WORKER_ID },
  );
  if (dqErr) {
    console.error("[process-call-recording-ingest] dequeue error", dqErr);
    return json({ error: "dequeue_failed", detail: dqErr.message }, 500);
  }

  const rows = (jobs ?? []) as JobRow[];
  processed = rows.length;

  type JobOutcome = { ok: true; dedupe: boolean } | { ok: false };

  const outcomes = await Promise.allSettled(rows.map(async (job): Promise<JobOutcome> => {
    const p = job.payload ?? ({} as JobPayload);
    try {
      // Validação mínima defensiva — dados vêm de cliente autenticado, mas nunca confiar.
      if (!p.id || !p.salesperson_id || !p.title || !p.audio_url) {
        throw new Error("payload_incomplete: id/salesperson_id/title/audio_url obrigatórios");
      }
      if (p.salesperson_id !== job.salesperson_id) {
        throw new Error("payload_mismatch: salesperson_id divergente do job");
      }

      // INSERT idempotente:
      //  • PK (id) evita reinserção do mesmo recording_id.
      //  • UNIQUE (salesperson_id, audio_url) evita duplicata do mesmo áudio.
      //  • ignoreDuplicates=true converte conflito em no-op → sucesso do job.
      const { error: insErr, count } = await admin
        .from("call_recordings")
        .upsert(
          {
            id: p.id,
            salesperson_id: p.salesperson_id,
            sale_id: p.sale_id ?? null,
            client_id: p.client_id ?? null,
            title: p.title,
            audio_url: p.audio_url,
            duration_seconds: p.duration_seconds ?? 0,
            status: p.status ?? "ready",
            participants: p.participants ?? null,
            metadata: p.metadata ?? {},
          },
          { onConflict: "id", ignoreDuplicates: true, count: "exact" },
        );

      let isDedupe = false;
      if (insErr) {
        // Se a UNIQUE (salesperson_id,audio_url) explodir, tratamos como dedup e concluímos.
        if (insErr.code === "23505") {
          isDedupe = true;
        } else {
          throw new Error(`db_insert: ${insErr.code ?? ""} ${insErr.message}`);
        }
      } else if ((count ?? 0) === 0) {
        isDedupe = true;
      }

      await admin.rpc("complete_call_recording_ingest_job", {
        _job_id: job.id, _success: true, _error: null,
      });
      return { ok: true, dedupe: isDedupe };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[process-call-recording-ingest] job=${job.id} attempt=${job.attempts} failed:`, msg);
      const { error: cErr } = await admin.rpc("complete_call_recording_ingest_job", {
        _job_id: job.id, _success: false, _error: msg.slice(0, 500),
      });
      if (cErr) console.error("[process-call-recording-ingest] complete failure error:", cErr);
      return { ok: false };
    }
  }));

  for (const r of outcomes) {
    const val = r.status === "fulfilled" ? r.value : { ok: false as const };
    if (val.ok) { succeeded++; if (val.dedupe) dedup++; }
    else failed++;
  }

  const summary = {
    worker: WORKER_ID,
    processed, succeeded, failed, deduped: dedup,
    duration_ms: Date.now() - startedAt,
  };
  console.log("[process-call-recording-ingest] batch done", summary);
  return json(summary, 200);
}));

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { getCorsHeaders(req), "Content-Type": "application/json" },
  });
}
