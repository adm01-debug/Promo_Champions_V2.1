import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId, logWithRequestId } from '../_shared/request-id.ts';
import { chunkedIn } from '../_shared/chunked-in.ts';
import { fetchWithTrace } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';
import {
  getUserClient,
  UnauthorizedError,
} from '../_shared/auth-client.ts';
import { isAuthorizedCronRequest } from '../_shared/cron-request-auth.ts';

const BITRIX24_DOMAIN = Deno.env.get('BITRIX24_DOMAIN');
const BITRIX24_CLIENT_ID = Deno.env.get('BITRIX24_CLIENT_ID');
const BITRIX24_CLIENT_SECRET = Deno.env.get('BITRIX24_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Bitrix24 Custom Field IDs (from user's Bitrix24 configuration)
const BITRIX_FIELD_RAMO_ATIVIDADE = 'UF_CRM_1590780873288';
const BITRIX_FIELD_NICHO_SEGMENTO = 'UF_CRM_1631795570468';

// TTL do lease de execução (edge_job_locks via RPC): um run morto no meio
// libera o lock automaticamente para a próxima tentativa.
const SYNC_LOCK_TTL_SECONDS = 15 * 60;
// Marcador 'pending:<epoch_ms>:<uuid>' gravado em sales.external_deal_id no
// claim atômico do push; velho demais = run anterior morreu → reclama.
const PENDING_CLAIM_STALE_MS = 60 * 60 * 1000;

// epoch_ms tem 13 dígitos até ~2286, então a ordem lexicográfica do marcador
// coincide com a numérica: dá para comparar no predicado SQL (PostgREST `lt`
// compara texto) em vez de filtrar só em memória.
function pendingStaleMarker(staleBeforeMs: number): string {
  return `pending:${String(Math.trunc(staleBeforeMs)).padStart(13, '0')}`;
}

function isStalePendingMarker(
  marker: string | null | undefined,
  staleBeforeMs: number
): boolean {
  if (!marker || !marker.startsWith('pending:')) return false;
  const ts = Number(marker.split(':')[1]);
  return Number.isFinite(ts) && ts < staleBeforeMs;
}

interface BitrixCompany {
  ID: string;
  TITLE: string;
  PHONE?: { VALUE: string }[];
  EMAIL?: { VALUE: string }[];
  UF_CRM_CAPITAL_SOCIAL?: string;
  UF_CRM_NUM_COLABORADORES?: string;
  // Allow dynamic custom field access
  [key: string]: unknown;
}

interface BitrixDeal {
  ID: string;
  TITLE: string;
  COMPANY_ID?: string;
  CONTACT_ID?: string;
  OPPORTUNITY?: string;
  STAGE_ID?: string;
  ASSIGNED_BY_ID?: string;
}

interface IcpData {
  client_id: string | null;
  bitrix_id: string | null;
  capital_social: number | null;
  num_colaboradores: number | null;
  ramo_atividade: string | null;
  grupo_nicho: string | null;
}

interface SyncLogData {
  sync_type: string;
  status: string;
  companies_from_bitrix: number;
  companies_to_bitrix: number;
  deals_from_bitrix: number;
  deals_to_bitrix: number;
  error_message?: string;
  duration_ms: number;
  triggered_by: string;
}

async function logSyncResult(supabase: SupabaseClient, logData: SyncLogData, requestId = '-') {
  try {
    await supabase.from('bitrix24_sync_logs').insert(logData);
    logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_log_saved', { status: logData.status });
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_log_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Margem de segurança: o access token do Bitrix24 expira em ~1h; renovamos
// um pouco antes para não morrer no meio de um lote de chamadas.
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

async function readStoredToken(requestId = '-'): Promise<{
  accessToken: string | null;
  expiresAt: string | null;
}> {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { data: rows } = await supabase
      .from('portfolio_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['bitrix24_access_token', 'bitrix24_token_expires']);

    const values = new Map(
      (rows ?? []).map(r => [r.setting_key as string, r.setting_value as string])
    );
    return {
      accessToken: values.get('bitrix24_access_token') ?? null,
      expiresAt: values.get('bitrix24_token_expires') ?? null,
    };
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'bitrix24_token_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { accessToken: null, expiresAt: null };
  }
}

// Delega o refresh ao bitrix24-oauth (?action=refresh), que só aceita chamadas
// internas assinadas com a service_role e já persiste os novos tokens.
async function refreshAccessToken(requestId = '-'): Promise<string | null> {
  try {
    const response = await fetchWithTrace(
      `${SUPABASE_URL}/functions/v1/bitrix24-oauth?action=refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: '{}',
      },
      {
        requestId,
        fnName: 'bitrix24-sync',
        operation: 'bitrix24_token_refresh',
      }
    );

    if (!response.ok) {
      logWithRequestId('warn', 'bitrix24-sync', requestId, 'bitrix24_token_refresh_failed', {
        status: response.status,
      });
      return null;
    }

    const { accessToken } = await readStoredToken(requestId);
    return accessToken;
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'bitrix24_token_refresh_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function getAccessToken(requestId = '-'): Promise<string | null> {
  const { accessToken, expiresAt } = await readStoredToken(requestId);

  const expiresInMs = expiresAt
    ? new Date(expiresAt).getTime() - Date.now()
    : 0;
  if (accessToken && expiresInMs > TOKEN_REFRESH_MARGIN_MS) {
    return accessToken;
  }

  // Token expirado/expirando (ou sem registro de expiração): renova antes de usar.
  const refreshed = await refreshAccessToken(requestId);
  if (refreshed) return refreshed;

  if (accessToken && expiresInMs > 0) {
    return accessToken;
  }

  logWithRequestId('warn', 'bitrix24-sync', requestId, 'bitrix24_no_access_token');
  return null;
}

async function bitrixApiCallJson(
  method: string,
  params: Record<string, unknown> = {},
  requestId = '-'
): Promise<Record<string, unknown>> {
  let accessToken = await getAccessToken(requestId);
  if (!accessToken) {
    throw new Error('No valid access token available');
  }

  const url = `https://${BITRIX24_DOMAIN}/rest/${method}`;
  let response = await callBitrixApi(url, accessToken, params, method, requestId);

  // Token pode ter expirado entre a leitura e a chamada (ou estar revogado):
  // renova uma única vez e reenvia.
  if (response.status === 401) {
    const refreshed = await refreshAccessToken(requestId);
    if (!refreshed) {
      throw new Error('Bitrix24 API error: 401 - token refresh failed');
    }
    accessToken = refreshed;
    response = await callBitrixApi(url, accessToken, params, method, requestId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bitrix24 API error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

async function bitrixApiCall(
  method: string,
  params: Record<string, unknown> = {},
  requestId = '-'
): Promise<unknown> {
  const data = await bitrixApiCallJson(method, params, requestId);
  return data.result;
}

// Os métodos *.list do Bitrix24 retornam no máximo 50 itens por chamada e
// sinalizam a próxima página no campo `next` (offset para `start=`).
// Sem paginar, cada sync enxergava só a primeira página.
const BITRIX_LIST_MAX_PAGES = 40; // 40 × 50 = 2000 itens por sync

async function bitrixApiListAll(
  method: string,
  params: Record<string, unknown> = {},
  requestId = '-',
  truncatedOut?: string[]
): Promise<unknown[]> {
  const items: unknown[] = [];
  let start: number | undefined;
  for (let page = 0; page < BITRIX_LIST_MAX_PAGES; page++) {
    const data = await bitrixApiCallJson(
      method,
      start === undefined ? params : { ...params, start },
      requestId
    );
    if (!Array.isArray(data.result) || data.result.length === 0) return items;
    items.push(...data.result);
    const next = data.next;
    if (typeof next !== 'number') return items;
    start = next;
  }
  // Cap atingido havendo `next`: o resultado é amostra — sinaliza em vez de
  // truncar em silêncio (vai para o log e para o `warnings` da resposta).
  logWithRequestId('warn', 'bitrix24-sync', requestId, 'bitrix24_list_cap_reached', {
    method,
    items: items.length,
    max_pages: BITRIX_LIST_MAX_PAGES,
  });
  truncatedOut?.push(method);
  return items;
}

async function callBitrixApi(
  url: string,
  accessToken: string,
  params: Record<string, unknown>,
  method: string,
  requestId: string
): Promise<Response> {
  return withEdgeCircuitBreaker(
    'bitrix24:api',
    async () => {
      const r = await fetchWithTrace(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      }, {
        requestId,
        fnName: 'bitrix24-sync',
        operation: `bitrix24_api:${method}`,
      });
      if (r.status >= 500) throw new Error(`bitrix24_5xx_${r.status}`);
      return r;
    },
    { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 35_000 }
  );
}

async function syncCompaniesToCRM(
  supabase: SupabaseClient,
  requestId = '-',
  truncatedOut?: string[]
): Promise<number> {
  logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_companies_from_bitrix_started');

  try {
    const companies = (await bitrixApiListAll('crm.company.list', {
      select: [
        'ID',
        'TITLE',
        'PHONE',
        'EMAIL',
        'UF_CRM_CAPITAL_SOCIAL',
        'UF_CRM_NUM_COLABORADORES',
        BITRIX_FIELD_RAMO_ATIVIDADE,
        BITRIX_FIELD_NICHO_SEGMENTO,
      ],
    }, requestId, truncatedOut)) as BitrixCompany[];

    if (!companies || !Array.isArray(companies)) {
      logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_companies_empty');
      return 0;
    }

    // Batch lookup: one query to find all existing ICP records for these Bitrix IDs
    const bitrixIds = companies.map(c => c.ID);
    const existingIcpList = await chunkedIn<{
      client_id: string | null;
      bitrix_id: string | null;
    }>(
      bitrixIds,
      chunk =>
        supabase.from('icp_data').select('client_id, bitrix_id').in('bitrix_id', chunk),
      { maxConcurrency: 4, label: 'bitrix24-sync.icp_by_bitrix' }
    );

    const icpByBitrixId = new Map<string, string>(); // bitrix_id -> client_id
    existingIcpList.forEach(icp => {
      if (icp.bitrix_id && icp.client_id) icpByBitrixId.set(icp.bitrix_id, icp.client_id);
    });

    const now = new Date().toISOString();

    // Process existing companies: parallel client updates + batch icp_data upsert
    const icpUpdates: Array<Record<string, unknown>> = [];
    const clientUpdateOps: Array<PromiseLike<unknown>> = [];
    for (const company of companies.filter(c => icpByBitrixId.has(c.ID))) {
      const clientId = icpByBitrixId.get(company.ID)!;
      clientUpdateOps.push(
        supabase
          .from('clients')
          .update({
            name: company.TITLE,
            phone: company.PHONE?.[0]?.VALUE || null,
            email: company.EMAIL?.[0]?.VALUE || null,
            updated_at: now,
          })
          .eq('id', clientId)
      );

      const ramoAtividade = (company[BITRIX_FIELD_RAMO_ATIVIDADE] as string) || null;
      const grupoNicho = (company[BITRIX_FIELD_NICHO_SEGMENTO] as string) || null;
      icpUpdates.push({
        client_id: clientId,
        bitrix_id: company.ID,
        capital_social: company.UF_CRM_CAPITAL_SOCIAL
          ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL as string)
          : null,
        num_colaboradores: company.UF_CRM_NUM_COLABORADORES
          ? parseInt(company.UF_CRM_NUM_COLABORADORES as string)
          : null,
        ramo_atividade: ramoAtividade,
        grupo_nicho: grupoNicho,
        is_icp_match: !!(ramoAtividade && grupoNicho),
        updated_at: now,
      });
    }
    await Promise.all([
      ...clientUpdateOps,
      icpUpdates.length > 0
        ? supabase.from('icp_data').upsert(icpUpdates, { onConflict: 'bitrix_id' })
        : Promise.resolve(),
    ]);

    // Process new companies: bulk insert clients, then bulk insert icp_data
    const newCompanies = companies.filter(c => !icpByBitrixId.has(c.ID));
    if (newCompanies.length > 0) {
      // IDs gerados aqui (clients.id tem default gen_random_uuid(), mas
      // assumir a ordem do INSERT RETURNING para casar insertedClients[i]
      // com newCompanies[i] era frágil): o pareamento company↔client_id fica
      // estável independente da ordem devolvida.
      const newClientRows = newCompanies.map(company => ({
        id: crypto.randomUUID(),
        name: company.TITLE,
        phone: company.PHONE?.[0]?.VALUE || null,
        email: company.EMAIL?.[0]?.VALUE || null,
        company: company.TITLE,
      }));

      const { data: insertedClients, error: insertClientsError } = await supabase
        .from('clients')
        .insert(newClientRows)
        .select('id');
      if (insertClientsError) throw insertClientsError;

      if (insertedClients?.length) {
        const icpInserts = newCompanies
          .map((company, i) => {
            const clientId = newClientRows[i]?.id;
            if (!clientId) return null;
            const ramoAtividade =
              (company[BITRIX_FIELD_RAMO_ATIVIDADE] as string) || null;
            const grupoNicho = (company[BITRIX_FIELD_NICHO_SEGMENTO] as string) || null;
            return {
              client_id: clientId,
              bitrix_id: company.ID,
              capital_social: company.UF_CRM_CAPITAL_SOCIAL
                ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL as string)
                : null,
              num_colaboradores: company.UF_CRM_NUM_COLABORADORES
                ? parseInt(company.UF_CRM_NUM_COLABORADORES as string)
                : null,
              ramo_atividade: ramoAtividade,
              grupo_nicho: grupoNicho,
              is_icp_match: !!(ramoAtividade && grupoNicho),
            };
          })
          .filter(Boolean);

        if (icpInserts.length > 0) {
          // Corrida residual (lease expirado, run manual sobreposto): duas
          // execuções inserindo o mesmo bitrix_id abortavam a sync inteira
          // com ux_icp_data_bitrix_id — duplicata vira skip.
          await supabase.from('icp_data').upsert(icpInserts, {
            onConflict: 'bitrix_id',
            ignoreDuplicates: true,
          });
        }
      }
    }

    logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_companies_from_bitrix_done', { count: companies.length });
    return companies.length;
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_companies_from_bitrix_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function syncDealsFromBitrix(
  supabase: SupabaseClient,
  requestId = '-',
  truncatedOut?: string[]
): Promise<number> {
  logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_deals_from_bitrix_started');

  try {
    const deals = (await bitrixApiListAll('crm.deal.list', {
      select: ['ID', 'TITLE', 'COMPANY_ID', 'CONTACT_ID', 'OPPORTUNITY', 'STAGE_ID'],
    }, requestId, truncatedOut)) as BitrixDeal[];

    if (!deals || !Array.isArray(deals)) {
      logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_deals_empty');
      return 0;
    }

    const stageMapping: Record<string, string> = {
      NEW: 'lead',
      PREPARATION: 'qualified',
      PREPAYMENT_INVOICE: 'proposal',
      EXECUTING: 'negotiation',
      FINAL_INVOICE: 'negotiation',
      WON: 'completed',
      LOSE: 'lost',
    };

    // Batch lookup: resolve all Bitrix company IDs to client names in one query
    const companyIds = deals.map(d => d.COMPANY_ID).filter(Boolean) as string[];
    const clientNameByBitrixId = new Map<string, string>();
    if (companyIds.length > 0) {
      // PostgREST embute o join many-to-one como objeto, mas a tipagem do
      // supabase-js infere array — aceita os dois shapes.
      type IcpJoinRow = {
        bitrix_id: string | null;
        clients: { name: string } | { name: string }[] | null;
      };
      const icpRows = await chunkedIn<IcpJoinRow>(
        companyIds,
        chunk =>
          supabase
            .from('icp_data')
            .select('bitrix_id, clients!inner(name)')
            .in('bitrix_id', chunk),
        { maxConcurrency: 4, label: 'bitrix24-sync.deals_client_names' }
      );
      icpRows.forEach(row => {
        const client = Array.isArray(row.clients)
          ? row.clients[0]
          : row.clients;
        if (row.bitrix_id && client?.name) {
          clientNameByBitrixId.set(row.bitrix_id, client.name);
        }
      });
    }

    // Dedupe primário por deal.ID (sales.external_deal_id, migration
    // 20261001190000). Se a coluna ainda não existir em produção, cai no
    // dedupe legado por client_name::product_name. Sem filtro de source:
    // vendas empurradas pelo syncDealsToBitrix recebem external_deal_id no
    // write-back e precisam casar aqui para não virar sale nova no pull.
    const dealIds = [...new Set(deals.map(d => d.ID))];
    const existingByDealId = new Map<string, string>();
    let hasExternalDealId = true;
    try {
      const dealIdRows = await chunkedIn<{
        id: string;
        external_deal_id: string | null;
      }>(
        dealIds,
        chunk =>
          supabase
            .from('sales')
            .select('id, external_deal_id')
            .in('external_deal_id', chunk),
        { maxConcurrency: 4, label: 'bitrix24-sync.existing_deals_by_deal_id' }
      );
      dealIdRows.forEach(s => {
        if (s.external_deal_id) existingByDealId.set(s.external_deal_id, s.id);
      });
    } catch (lookupError) {
      hasExternalDealId = false;
      console.warn(
        'external_deal_id indisponível; usando dedupe legado por nome',
        lookupError
      );
    }

    // Batch lookup (legado): pre-fetch sales por client_name p/ linhas
    // sincronizadas antes do external_deal_id existir.
    const allClientNames = [
      ...new Set(
        deals.map(
          d => (d.COMPANY_ID && clientNameByBitrixId.get(d.COMPANY_ID)) || d.TITLE
        )
      ),
    ];
    const existingSalesRows =
      allClientNames.length > 0
        ? await chunkedIn<{ id: string; client_name: string; product_name: string }>(
            allClientNames,
            chunk =>
              supabase
                .from('sales')
                .select('id, client_name, product_name')
                .in('client_name', chunk),
            { maxConcurrency: 4, label: 'bitrix24-sync.existing_deals_by_client' }
          )
        : [];

    const existingSaleMap = new Map<string, string>();
    existingSalesRows.forEach(s => {
      existingSaleMap.set(`${s.client_name}::${s.product_name}`, s.id);
    });

    const insertRows: Array<Record<string, unknown>> = [];
    const updateOps: Array<PromiseLike<unknown>> = [];
    const syncNow = new Date().toISOString();
    const seenDealIds = new Set<string>();

    for (const deal of deals) {
      if (seenDealIds.has(deal.ID)) continue;
      seenDealIds.add(deal.ID);

      const clientName =
        (deal.COMPANY_ID && clientNameByBitrixId.get(deal.COMPANY_ID)) || deal.TITLE;
      const status = stageMapping[deal.STAGE_ID || 'NEW'] || 'lead';
      const amount = deal.OPPORTUNITY ? parseFloat(deal.OPPORTUNITY) : 0;
      const key = `${clientName}::${deal.TITLE}`;
      const existingId =
        existingByDealId.get(deal.ID) ?? existingSaleMap.get(key);

      if (existingId) {
        updateOps.push(
          supabase
            .from('sales')
            .update({
              amount,
              status,
              updated_at: syncNow,
              // Backfill do vínculo em linhas sincronizadas antes da coluna existir
              ...(hasExternalDealId ? { external_deal_id: deal.ID } : {}),
            })
            .eq('id', existingId)
        );
      } else {
        insertRows.push({
          client_name: clientName,
          product_name: deal.TITLE,
          amount,
          status,
          source: 'bitrix24',
          ...(hasExternalDealId ? { external_deal_id: deal.ID } : {}),
        });
      }
    }

    await Promise.all([
      insertRows.length > 0
        ? hasExternalDealId
          ? // ON CONFLICT DO NOTHING: duas execuções concorrentes do sync
            // não duplicam deals (ux_sales_source_external_deal)
            supabase
              .from('sales')
              .upsert(insertRows, {
                onConflict: 'source,external_deal_id',
                ignoreDuplicates: true,
              })
          : supabase.from('sales').insert(insertRows)
        : Promise.resolve(),
      ...updateOps,
    ]);

    logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_deals_from_bitrix_done', { count: deals.length });
    return deals.length;
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_deals_from_bitrix_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function syncCompaniesToBitrix(
  supabase: SupabaseClient,
  requestId = '-'
): Promise<number> {
  logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_companies_to_bitrix_started');

  try {
    // Paginação completa com ORDER estável: `.limit(1000)` solto lia só a
    // primeira página e em ordem indefinida.
    const allClients: Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      company: string | null;
    }> = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: pageRows, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, phone, company')
        .order('id')
        .range(offset, offset + 999);
      if (clientsError) throw clientsError;
      if (!pageRows?.length) break;
      allClients.push(...(pageRows as typeof allClients));
      if (pageRows.length < 1000) break;
    }

    const clientIds = allClients.map(c => c.id);

    const icpDataList = await chunkedIn<IcpData>(
      clientIds,
      chunk =>
        supabase
          .from('icp_data')
          .select(
            'client_id, bitrix_id, capital_social, num_colaboradores, ramo_atividade, grupo_nicho'
          )
          .in('client_id', chunk),
      { maxConcurrency: 4, label: 'bitrix24-sync.icp_by_client' }
    );

    const icpMap = new Map<string, IcpData>();
    icpDataList.forEach(icp => {
      if (icp.client_id) icpMap.set(icp.client_id, icp);
    });

    // Marcador 'pending' recente indica outro run em voo → pula; velho é
    // resíduo de run morto → reclama (mesmo critério do push de deals).
    const pendingStaleBefore = Date.now() - PENDING_CLAIM_STALE_MS;
    const staleMarker = pendingStaleMarker(pendingStaleBefore);
    const clientsToSync = allClients.filter(client => {
      const bitrixId = icpMap.get(client.id)?.bitrix_id;
      return !bitrixId || isStalePendingMarker(bitrixId, pendingStaleBefore);
    });

    let syncedCount = 0;
    for (const client of clientsToSync) {
      try {
        const icp = icpMap.get(client.id);

        // Claim atômico antes do crm.company.add (mesmo padrão do push de
        // deals): sem ele, runs sobrepostos (lease expirado ou reinvocação
        // manual) criavam a empresa duas vezes no Bitrix. O write-back
        // abaixo substitui o marcador pelo ID real; se a run morrer entre
        // os dois, o marcador expira e o próximo run reclama.
        const claimId = `pending:${Date.now()}:${crypto.randomUUID()}`;
        let claimed = false;
        if (icp) {
          // Linha icp_data existe: UPDATE condicional — só casa se
          // bitrix_id estiver NULL ou com marcador pending mais velho que o
          // limiar (o pending fresco de outro run não casa).
          const { data: claimRows, error: claimError } = await supabase
            .from('icp_data')
            .update({ bitrix_id: claimId })
            .eq('client_id', client.id)
            .or(
              `bitrix_id.is.null,and(bitrix_id.like."pending:%",bitrix_id.lt."${staleMarker}")`
            )
            .select('client_id');
          if (claimError) throw claimError;
          claimed = (claimRows?.length ?? 0) > 0;
        } else {
          // Sem linha icp_data: o INSERT disputa pelo UNIQUE(client_id) —
          // quem perder a corrida recebe 23505 e pula o cliente.
          const { error: claimInsertError } = await supabase
            .from('icp_data')
            .insert({ client_id: client.id, bitrix_id: claimId });
          if (claimInsertError) {
            if (claimInsertError.code === '23505') continue;
            throw claimInsertError;
          }
          claimed = true;
        }
        if (!claimed) continue;

        const result = (await bitrixApiCall('crm.company.add', {
          fields: {
            TITLE: client.company || client.name,
            PHONE: client.phone ? [{ VALUE: client.phone, VALUE_TYPE: 'WORK' }] : [],
            EMAIL: client.email ? [{ VALUE: client.email, VALUE_TYPE: 'WORK' }] : [],
            UF_CRM_CAPITAL_SOCIAL: icp?.capital_social?.toString(),
            UF_CRM_NUM_COLABORADORES: icp?.num_colaboradores?.toString(),
            [BITRIX_FIELD_RAMO_ATIVIDADE]: icp?.ramo_atividade,
            [BITRIX_FIELD_NICHO_SEGMENTO]: icp?.grupo_nicho,
          },
        }, requestId)) as string;

        if (result) {
          // Write-back do ID real — só se ainda detivermos o marcador.
          const { error: writeBackError } = await supabase
            .from('icp_data')
            .update({ bitrix_id: result })
            .eq('client_id', client.id)
            .eq('bitrix_id', claimId);
          if (writeBackError) throw writeBackError;
          syncedCount++;
        }
      } catch (error) {
        if (error instanceof CircuitBreakerOpenError) throw error;
        logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_client_to_bitrix_failed', {
          client_id: client.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_companies_to_bitrix_done', { count: syncedCount });
    return syncedCount;
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_companies_to_bitrix_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function syncDealsToBitrix(supabase: SupabaseClient, requestId = '-'): Promise<number> {
  logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_deals_to_bitrix_started');

  try {
    const statusMapping: Record<string, string> = {
      lead: 'NEW',
      qualified: 'PREPARATION',
      proposal: 'PREPAYMENT_INVOICE',
      negotiation: 'EXECUTING',
      completed: 'WON',
      lost: 'LOSE',
    };

    // Só vendas ainda não sincronizadas: external_deal_id é o write-back do
    // deal.ID no Bitrix (mesmo padrão do icp_data.bitrix_id nas empresas).
    // Sem esse filtro o lote de 50 reempurrava as mesmas vendas a cada run
    // e duplicava deals no CRM. `source IS NULL` também entra no push (NULL
    // não casa `.neq`, então vendas sem origem ficavam presas); e marcadores
    // 'pending:*' velhos (>1h) são reclamados — run anterior morreu no meio.
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, client_name, product_name, amount, status, external_deal_id')
      .or('source.is.null,source.neq.bitrix24')
      .or('external_deal_id.is.null,external_deal_id.like.pending:%')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (salesError) {
      // Coluna ausente em produção (migration 20261001190000 pendente): falha
      // fechada — sem write-back cada run duplicaria deals no Bitrix.
      logWithRequestId('warn', 'bitrix24-sync', requestId, 'sync_deals_external_id_unavailable', {
        error: salesError.message,
      });
      return 0;
    }
    if (!sales) return 0;

    // Marcador 'pending' recente indica outro run em voo → pula; velho
    // (>PENDING_CLAIM_STALE_MS) é resíduo de run morto → reclama.
    const pendingStaleBefore = Date.now() - PENDING_CLAIM_STALE_MS;
    const staleMarker = pendingStaleMarker(pendingStaleBefore);
    const claimableSales = sales.filter(
      s => !s.external_deal_id || isStalePendingMarker(s.external_deal_id, pendingStaleBefore)
    );

    // Batch lookup: all client names → IDs → bitrix_ids in two queries
    const clientNames = [...new Set(claimableSales.map(s => s.client_name).filter(Boolean))];
    const bitrixIdByClientName = new Map<string, string>();
    if (clientNames.length > 0) {
      const clientRows = await chunkedIn<{ id: string; name: string }>(
        clientNames,
        chunk => supabase.from('clients').select('id, name').in('name', chunk),
        { maxConcurrency: 4, label: 'bitrix24-sync.clients_by_name' }
      );

      if (clientRows.length) {
        const clientIds = clientRows.map(c => c.id);
        const icpRows = await chunkedIn<{
          client_id: string | null;
          bitrix_id: string | null;
        }>(
          clientIds,
          chunk =>
            supabase
              .from('icp_data')
              .select('client_id, bitrix_id')
              .in('client_id', chunk),
          { maxConcurrency: 4, label: 'bitrix24-sync.icp_by_client_reverse' }
        );

        const bitrixIdByClientId = new Map<string, string>();
        icpRows.forEach(icp => {
          if (icp.client_id && icp.bitrix_id)
            bitrixIdByClientId.set(icp.client_id, icp.bitrix_id);
        });
        clientRows.forEach(c => {
          const bitrixId = bitrixIdByClientId.get(c.id);
          if (bitrixId) bitrixIdByClientName.set(c.name, bitrixId);
        });
      }
    }

    let syncedCount = 0;
    for (const sale of claimableSales) {
      try {
        const companyId = sale.client_name
          ? bitrixIdByClientName.get(sale.client_name)
          : undefined;

        // Claim atômico antes do crm.deal.add: o WHERE condicional marca a
        // venda numa única operação — um run sobreposto (lease expirado ou
        // reinvocação manual) não casa e pula a venda em vez de criar um
        // segundo deal no Bitrix. O filtro de staleness está no predicado:
        // marcador 'pending' só é reclamado se mais velho que o limiar —
        // o pending FRESCO de outro run em voo não casa (epoch_ms tem 13
        // dígitos, então `lt` lexicográfico equivale à comparação numérica).
        // O write-back abaixo substitui o marcador pelo deal.ID real; se a
        // run morrer entre os dois, o pull casa o deal por
        // client_name::product_name e repara o vínculo.
        const claimId = `pending:${Date.now()}:${crypto.randomUUID()}`;
        const { data: claimed, error: claimError } = await supabase
          .from('sales')
          .update({ external_deal_id: claimId })
          .eq('id', sale.id)
          .or(
            `external_deal_id.is.null,and(external_deal_id.like."pending:%",external_deal_id.lt."${staleMarker}")`
          )
          .select('id');
        if (claimError) throw claimError;
        if (!claimed?.length) continue;

        const result = (await bitrixApiCall('crm.deal.add', {
          fields: {
            TITLE: sale.product_name,
            OPPORTUNITY: sale.amount,
            STAGE_ID: statusMapping[sale.status] || 'NEW',
            COMPANY_ID: companyId,
          },
        }, requestId)) as string | number | undefined;

        const dealId = result != null ? String(result) : null;
        if (dealId) {
          // Write-back do deal.ID: a próxima execução filtra a venda e o pull
          // a reconhece pelo dedupe de deal.ID em vez de reimportá-la.
          const { error: writeBackError } = await supabase
            .from('sales')
            .update({ external_deal_id: dealId })
            .eq('id', sale.id);
          if (writeBackError) throw writeBackError;
          syncedCount++;
        }
      } catch (error) {
        if (error instanceof CircuitBreakerOpenError) throw error;
        logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_sale_to_bitrix_failed', {
          sale_id: sale.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logWithRequestId('info', 'bitrix24-sync', requestId, 'sync_deals_to_bitrix_done', { count: syncedCount });
    return syncedCount;
  } catch (error) {
    logWithRequestId('error', 'bitrix24-sync', requestId, 'sync_deals_to_bitrix_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

Deno.serve(
  withRequestId('bitrix24-sync', async (req, ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const startTime = Date.now();
    let syncLockHeld = false;

    try {
      if (!BITRIX24_DOMAIN || !BITRIX24_CLIENT_ID || !BITRIX24_CLIENT_SECRET) {
        throw new Error('Bitrix24 credentials not configured');
      }

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase credentials not configured');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // SEC: antes desta verificação, qualquer chamada com a anon key executava
      // um sync bidirecional completo (escrita em clients/sales + chamadas à
      // API do Bitrix) como service_role. Agora só passa job interno
      // (service_role ou X-Cron-Secret) ou usuário com papel admin/manager.
      let authorizedByCron = false;
      try {
        authorizedByCron = await isAuthorizedCronRequest(req, async () => {
          const { data, error } = await supabase
            .from('_internal_secrets')
            .select('value')
            .eq('key', 'coaching_cron_secret')
            .maybeSingle();
          if (error) throw error;
          return (data as { value?: string | null } | null)?.value;
        });
      } catch (authError) {
        console.error('bitrix24-sync cron authorization unavailable:', authError);
        return new Response(
          JSON.stringify({ success: false, error: 'authorization_unavailable' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!authorizedByCron) {
        try {
          const caller = await getUserClient(req);
          const { data: allowed, error: roleError } = await caller.client.rpc(
            'is_admin_or_manager' as never,
            { _user_id: caller.userId } as never
          );
          if (roleError) throw roleError;
          if (!allowed) {
            return new Response(
              JSON.stringify({ success: false, error: 'forbidden' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (authError) {
          if (authError instanceof UnauthorizedError) {
            return new Response(
              JSON.stringify({ success: false, error: 'unauthorized' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.error('bitrix24-sync authorization failed:', authError);
          return new Response(
            JSON.stringify({ success: false, error: 'authorization_unavailable' }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const body = await req.json().catch(() => ({}));
      const action = body.action || 'sync-all';
      const triggeredBy = body.triggered_by || 'manual';

      // Mutex entre execuções (cron + manual + retries): lease em tabela
      // via RPC (migration 20261027120100). Sem ele, dois runs sobrepostos
      // liam o mesmo lote `external_deal_id IS NULL` e duplicavam deals no
      // Bitrix; o pull de companies também podia estourar
      // ux_icp_data_bitrix_id. O lease expira por TTL — um run morto não
      // trava o próximo.
      const { data: lockAcquired, error: lockError } = await supabase.rpc(
        'try_edge_job_lock',
        {
          _job_name: 'bitrix24-sync',
          _ttl_seconds: SYNC_LOCK_TTL_SECONDS,
          _request_id: ctx.requestId,
        }
      );
      if (lockError) throw lockError;
      if (lockAcquired !== true) {
        logWithRequestId('info', 'bitrix24-sync', ctx.requestId, 'bitrix24_sync_skipped_locked', { action });
        await logSyncResult(supabase, {
          sync_type: action,
          status: 'skipped',
          companies_from_bitrix: 0,
          companies_to_bitrix: 0,
          deals_from_bitrix: 0,
          deals_to_bitrix: 0,
          error_message: 'sync_already_running',
          duration_ms: Date.now() - startTime,
          triggered_by: triggeredBy,
        }, ctx.requestId);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'sync_already_running',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      syncLockHeld = true;

      // Listas do Bitrix truncadas no cap de páginas são sinalizadas aqui
      // (log warn dentro de bitrixApiListAll + warnings na resposta e nota
      // no bitrix24_sync_logs.error_message).
      const truncatedLists: string[] = [];

      let result: Record<string, number> = {
        companiesFromBitrix: 0,
        dealsFromBitrix: 0,
        companiesToBitrix: 0,
        dealsToBitrix: 0,
      };

      switch (action) {
        case 'sync-companies-from-bitrix':
          result.companiesFromBitrix = await syncCompaniesToCRM(supabase, ctx.requestId, truncatedLists);
          break;
        case 'sync-companies-to-bitrix':
          result.companiesToBitrix = await syncCompaniesToBitrix(supabase, ctx.requestId);
          break;
        case 'sync-deals-from-bitrix':
          result.dealsFromBitrix = await syncDealsFromBitrix(supabase, ctx.requestId, truncatedLists);
          break;
        case 'sync-deals-to-bitrix':
          result.dealsToBitrix = await syncDealsToBitrix(supabase, ctx.requestId);
          break;
        case 'sync-all':
        default:
          result = {
            companiesFromBitrix: await syncCompaniesToCRM(supabase, ctx.requestId, truncatedLists),
            dealsFromBitrix: await syncDealsFromBitrix(supabase, ctx.requestId, truncatedLists),
            companiesToBitrix: await syncCompaniesToBitrix(supabase, ctx.requestId),
            dealsToBitrix: await syncDealsToBitrix(supabase, ctx.requestId),
          };
          break;
      }

      const durationMs = Date.now() - startTime;
      const truncationNote = truncatedLists.length
        ? `bitrix24_list_cap_reached: ${[...new Set(truncatedLists)].join(',')}`
        : undefined;

      // Log successful sync
      await logSyncResult(supabase, {
        sync_type: action,
        status: 'success',
        companies_from_bitrix: result.companiesFromBitrix,
        companies_to_bitrix: result.companiesToBitrix,
        deals_from_bitrix: result.dealsFromBitrix,
        deals_to_bitrix: result.dealsToBitrix,
        error_message: truncationNote,
        duration_ms: durationMs,
        triggered_by: triggeredBy,
      }, ctx.requestId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Bitrix24 sync completed',
          result,
          duration_ms: durationMs,
          timestamp: new Date().toISOString(),
          ...(truncationNote ? { warnings: [truncationNote] } : {}),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      ctx.log('error', 'bitrix24_sync_failed', { error: errorMessage });

      // Log failed sync
      try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        const body = await req
          .clone()
          .json()
          .catch(() => ({}));

        await logSyncResult(supabase, {
          sync_type: body.action || 'sync-all',
          status: 'error',
          companies_from_bitrix: 0,
          companies_to_bitrix: 0,
          deals_from_bitrix: 0,
          deals_to_bitrix: 0,
          error_message: errorMessage,
          duration_ms: durationMs,
          triggered_by: body.triggered_by || 'manual',
        }, ctx.requestId);
      } catch (logError) {
        ctx.log('error', 'sync_failure_log_failed', {
          error: logError instanceof Error ? logError.message : String(logError),
        });
      }

      if (error instanceof CircuitBreakerOpenError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'circuit_open',
            message: 'Bitrix24 temporariamente indisponível',
            duration_ms: durationMs,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          duration_ms: durationMs,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } finally {
      if (syncLockHeld) {
        try {
          const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
          // Só o detentor libera: um run morto que perdeu o lease por TTL
          // não pode apagar o lock do run que o herdou.
          await supabase.rpc('release_edge_job_lock', {
            _job_name: 'bitrix24-sync',
            _request_id: ctx.requestId,
          });
        } catch (unlockError) {
          ctx.log('warn', 'bitrix24_sync_lock_release_failed', {
            error: unlockError instanceof Error ? unlockError.message : String(unlockError),
          });
        }
      }
    }
  })
);
