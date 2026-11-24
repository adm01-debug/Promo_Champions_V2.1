import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";

const SLOW_QUERY_THRESHOLD_MS = 3000;
const VERY_SLOW_QUERY_THRESHOLD_MS = 8000;

function emitTelemetry(meta: {
  operation: string;
  table?: string;
  rpcName?: string;
  limit?: number;
  offset?: number;
  countMode?: string;
  durationMs: number;
  recordCount?: number;
  status: 'ok' | 'error' | 'slow' | 'very_slow';
  error?: string;
  userId?: string | null;
}) {
  const icon =
    meta.status === 'very_slow'
      ? '🔴'
      : meta.status === 'slow'
        ? '🟡'
        : meta.status === 'error'
          ? '❌'
          : '✅';

  const target = meta.rpcName || meta.table || 'unknown';
  const line =
    `${icon} [telemetry] ${meta.operation}:${target} ${meta.durationMs}ms` +
    ` | records=${meta.recordCount ?? '-'}` +
    ` limit=${meta.limit ?? '-'}` +
    ` offset=${meta.offset ?? '-'}` +
    ` count=${meta.countMode ?? '-'}`;

  if (meta.status === 'very_slow') {
    console.warn(`⚠️ VERY SLOW QUERY: ${line}`);
  } else if (meta.status === 'slow') {
    console.warn(`⚠️ SLOW QUERY: ${line}`);
  } else if (meta.status === 'error') {
    console.error(line + ` error=${meta.error}`);
  } else {
    console.info(line);
  }

  // Persist to local DB (fire-and-forget) — only for non-ok statuses
  if (meta.status !== 'ok') {
    try {
      const localUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (localUrl && serviceKey) {
        const localClient = createClient(localUrl, serviceKey);
        localClient
          .from('query_telemetry')
          .insert({
            operation: meta.operation,
            table_name: meta.table || null,
            rpc_name: meta.rpcName || null,
            duration_ms: meta.durationMs,
            record_count: meta.recordCount ?? null,
            query_limit: meta.limit ?? null,
            query_offset: meta.offset ?? null,
            count_mode: meta.countMode || null,
            severity: meta.status,
            error_message: meta.error || null,
            user_id: meta.userId || null,
          })
          .then(({ error: insertErr }) => {
            if (insertErr)
              console.warn('[telemetry-persist] Insert failed:', insertErr.message);
          });
      }
    } catch (_e) {
      // Fire-and-forget: NEVER block main response
    }
  }
}

// Explicit allowlist of tables that may be accessed through this bridge
const ALLOWED_TABLES = new Set([
  'clients',
  'salespeople',
  'sales',
  'activities',
  'tasks',
  'products',
  'quotes',
  'icp_data',
  'goals',
  'notifications',
]);

// QA-219 — allowlist de colunas por tabela, espelhando o schema versionado em
// src/integrations/supabase/types.ts. A allowlist de tabelas não bastava: o
// `select` aceitava a sintaxe de recurso embutido do PostgREST
// (`*, outra_tabela(*)`), alcançando tabelas relacionadas fora da lista.
const SAFE_COLUMN = /^[a-z_][a-z0-9_]*$/;
const ALLOWED_COLUMNS: Record<string, readonly string[]> = {
  activities: [
    'activity_type', 'client_id', 'contact_name', 'created_at', 'delete_reason',
    'deleted_at', 'deleted_by', 'duration_minutes', 'id', 'lead_status', 'mql_qualified_at',
    'notes', 'outcome', 'qualification_score', 'sale_id', 'salesperson_id'
  ],
  clients: [
    'activated_at', 'company', 'created_at', 'delete_reason', 'deleted_at', 'deleted_by',
    'email', 'email_verified', 'id', 'is_activated', 'last_enrichment_id',
    'last_interaction_at', 'lat', 'lead_source', 'lng', 'name', 'phone', 'phone_verified',
    'ramo_atividade', 'total_value', 'updated_at', 'user_id'
  ],
  icp_data: [
    'bitrix_id', 'capital_social', 'client_id', 'created_at', 'grupo_nicho', 'icp_score',
    'id', 'is_icp_match', 'num_colaboradores', 'ramo_atividade', 'updated_at'
  ],
  notifications: [
    'action_label', 'action_url', 'archived_at', 'category', 'created_at', 'expires_at',
    'icon', 'id', 'message', 'metadata', 'priority', 'read_at', 'title', 'type', 'user_id'
  ],
  products: [
    'category', 'cost_synced_at', 'created_at', 'default_cost', 'delete_reason',
    'deleted_at', 'deleted_by', 'description', 'id', 'min_stock_level', 'name', 'price',
    'rating', 'sales_count', 'sku', 'status', 'stock_quantity', 'updated_at'
  ],
  quotes: [
    'approved_at', 'billing_status', 'client_email', 'client_id', 'client_name',
    'client_phone', 'contract_end_date', 'contract_start_date', 'created_at', 'created_by',
    'currency', 'delete_reason', 'deleted_at', 'deleted_by', 'description',
    'discount_amount', 'discount_percent', 'exchange_rate', 'external_quote_id',
    'external_reference', 'external_seller_id', 'id', 'items', 'last_synced_at', 'notes',
    'pdf_url', 'quote_number', 'rejected_at', 'rejection_reason', 'sale_id', 'seller_name',
    'sent_at', 'source', 'status', 'subscription_type', 'subtotal', 'sync_status',
    'synced_from_external', 'title', 'total_value', 'updated_at', 'valid_until', 'version'
  ],
  sales: [
    'account_id', 'ai_prediction_reasoning', 'ai_prediction_score', 'amount',
    'broadcast_sent_at', 'category', 'client_id', 'client_name', 'closed_at', 'closer_id',
    'competitor_name', 'competitor_price_at_deal', 'cost_source', 'cost_synced_at',
    'created_at', 'deal_status', 'delete_reason', 'deleted_at', 'deleted_by',
    'enrichment_data', 'enrichment_status', 'external_deal_id', 'forecast_category', 'id',
    'is_first_sale', 'loss_reason', 'lost_to_competitor_id', 'margin_amount', 'markup_pct',
    'notes', 'pipeline_id', 'product_id', 'product_name', 'salesperson_id',
    'script_variant', 'sdr_id', 'segment', 'sku', 'source', 'stage', 'status',
    'stock_reduced', 'territory_id', 'total_cost', 'unit_cost', 'updated_at', 'version',
    'whatsapp_last_interaction', 'whatsapp_status'
  ],
  salespeople: [
    'auth_user_id', 'avatar_url', 'commission_rate', 'created_at', 'email', 'id',
    'is_active', 'name', 'notify_sales_email', 'notify_sales_in_app', 'role', 'score_total',
    'squad_id', 'updated_at'
  ],
  tasks: [
    'client_id', 'completed_at', 'created_at', 'delete_reason', 'deleted_at', 'deleted_by',
    'description', 'due_date', 'due_time', 'id', 'priority', 'sale_id', 'salesperson_id',
    'source_insight_id', 'status', 'task_type', 'title', 'updated_at'
  ],
};


// Allowlist de RPCs executáveis via `operation: 'rpc'`. Vazia por padrão:
// nenhum consumidor conhecido chama rpc hoje e rpc livre num banco externo
// equivale a SQL arbitrário. Habilite nomes pontuais via secret
// EXTERNAL_BRIDGE_ALLOWED_RPCS (lista separada por vírgula) quando uma
// integração precisar.
const ALLOWED_RPCS = new Set(
  (Deno.env.get('EXTERNAL_BRIDGE_ALLOWED_RPCS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const RPC_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Resolve as colunas pedidas contra a allowlist da tabela. Recusa `*`, alias
 * (`apelido:coluna`), recursos embutidos (`tabela(*)`) e qualquer coluna fora da
 * lista — a sintaxe do PostgREST é ampla demais para confiar no corpo.
 */
function resolveSelectColumns(
  table: string,
  raw: unknown,
): { columns: string } | { error: string } {
  if (raw === undefined || raw === null || raw === '') return { columns: '*' };
  if (typeof raw !== 'string') return { error: 'columns deve ser uma string' };
  const requested = raw.split(',').map((c) => c.trim()).filter(Boolean);
  if (requested.length === 0) return { columns: '*' };
  const allowed = ALLOWED_COLUMNS[table];
  const invalid = requested.filter(
    (c) => !SAFE_COLUMN.test(c) || (allowed ? !allowed.includes(c) : false),
  );
  if (invalid.length > 0) return { error: `colunas não permitidas: ${invalid.join(', ')}` };
  return { columns: requested.join(',') };
}

Deno.serve(withRequestId("external-db-bridge", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Require authentication — this function proxies arbitrary queries to an external database
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const localUrl = Deno.env.get('SUPABASE_URL')!;
  const localAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(localUrl, localAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userId = user.id;

  // Este bridge executa queries arbitrárias num banco externo com a anon key
  // dele — restrito a admin/manager, na mesma linha das outras superfícies
  // administrativas (customer-success-360, admin-conversion-trail).
  const { data: isAdminOrManager, error: roleError } = await authClient.rpc(
    'is_admin_or_manager' as never,
    { _user_id: userId } as never,
  );
  if (roleError) {
    console.error('external-db-bridge role check failed:', roleError.message);
    return new Response(JSON.stringify({ error: 'authorization_unavailable' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!isAdminOrManager) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      operation,
      table,
      rpcName,
      columns,
      filters,
      data: bodyData,
      limit,
      offset,
      countMode,
    } = await req.json();

    // Validate table against allowlist to prevent arbitrary data exfiltration
    if (table && !ALLOWED_TABLES.has(table)) {
      return new Response(
        JSON.stringify({
          error: `Table '${table}' is not accessible through this bridge`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate rpcName against allowlist — rpc livre equivale a SQL arbitrário
    // no banco externo. A lista vem de EXTERNAL_BRIDGE_ALLOWED_RPCS (vazia por
    // padrão: nenhum RPC é permitido até ser habilitado explicitamente).
    if (operation === 'rpc' && (!rpcName || !RPC_NAME_RE.test(rpcName) || !ALLOWED_RPCS.has(rpcName))) {
      return new Response(
        JSON.stringify({
          error: `RPC '${rpcName ?? ''}' is not accessible through this bridge`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to external DB
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY');

    if (!externalUrl || !externalKey) {
      return new Response(JSON.stringify({ error: 'External database not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const externalClient = createClient(externalUrl, externalKey);

    const resolvedColumns = resolveSelectColumns(table, columns);
    if ('error' in resolvedColumns) {
      return new Response(JSON.stringify({ error: resolvedColumns.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const selectColumns = resolvedColumns.columns;
    const queryLimit = limit || 100;
    const queryOffset = offset || 0;
    const queryCountMode = countMode || 'none';

    if (operation === 'select') {
      const startTime = performance.now();
      let query = externalClient.from(table).select(selectColumns, {
        count:
          queryCountMode === 'none'
            ? undefined
            : (queryCountMode as 'exact' | 'planned' | 'estimated'),
      });

      // Apply filters
      if (filters) {
        for (const f of filters) {
          if (f.type === 'eq') query = query.eq(f.column, f.value);
          else if (f.type === 'neq') query = query.neq(f.column, f.value);
          else if (f.type === 'gt') query = query.gt(f.column, f.value);
          else if (f.type === 'gte') query = query.gte(f.column, f.value);
          else if (f.type === 'lt') query = query.lt(f.column, f.value);
          else if (f.type === 'lte') query = query.lte(f.column, f.value);
          else if (f.type === 'like') query = query.like(f.column, f.value);
          else if (f.type === 'ilike') query = query.ilike(f.column, f.value);
          else if (f.type === 'in') query = query.in(f.column, f.value);
          else if (f.type === 'order')
            query = query.order(f.column, { ascending: f.ascending ?? true });
        }
      }

      query = query.range(queryOffset, queryOffset + queryLimit - 1);

      const { data: selectData, error: selectError, count } = await query;
      const durationMs = Math.round(performance.now() - startTime);

      const status = selectError
        ? 'error'
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS
          ? 'very_slow'
          : durationMs >= SLOW_QUERY_THRESHOLD_MS
            ? 'slow'
            : 'ok';

      emitTelemetry({
        operation: 'select',
        table,
        limit: queryLimit,
        offset: queryOffset,
        countMode: queryCountMode,
        durationMs,
        status,
        recordCount: selectData?.length ?? 0,
        error: selectError?.message,
        userId,
      });

      if (selectError) {
        return new Response(JSON.stringify({ error: selectError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({ data: selectData, count, duration_ms: durationMs }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (operation === 'rpc') {
      const startTime = performance.now();
      const { data: rpcData, error: rpcError } = await externalClient.rpc(
        rpcName,
        bodyData || {}
      );
      const durationMs = Math.round(performance.now() - startTime);

      const status = rpcError
        ? 'error'
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS
          ? 'very_slow'
          : durationMs >= SLOW_QUERY_THRESHOLD_MS
            ? 'slow'
            : 'ok';

      emitTelemetry({
        operation: 'rpc',
        rpcName,
        durationMs,
        status,
        recordCount: Array.isArray(rpcData) ? rpcData.length : undefined,
        error: rpcError?.message,
        userId,
      });

      if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data: rpcData, duration_ms: durationMs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // insert/update/delete
    if (['insert', 'update', 'delete'].includes(operation)) {
      const startTime = performance.now();
      let result;

      if (operation === 'insert') {
        result = await externalClient.from(table).insert(bodyData).select();
      } else if (operation === 'update') {
        let q = externalClient.from(table).update(bodyData);
        if (filters) {
          for (const f of filters) {
            if (f.type === 'eq') q = q.eq(f.column, f.value);
          }
        }
        result = await q.select();
      } else {
        let q = externalClient.from(table).delete();
        if (filters) {
          for (const f of filters) {
            if (f.type === 'eq') q = q.eq(f.column, f.value);
          }
        }
        result = await q.select();
      }

      const durationMs = Math.round(performance.now() - startTime);
      const status = result.error
        ? 'error'
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS
          ? 'very_slow'
          : durationMs >= SLOW_QUERY_THRESHOLD_MS
            ? 'slow'
            : 'ok';

      emitTelemetry({
        operation,
        table,
        durationMs,
        status,
        recordCount: result.data?.length ?? 0,
        error: result.error?.message,
        userId,
      });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({ data: result.data, duration_ms: durationMs }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Bridge error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
