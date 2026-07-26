import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";



interface PortfolioSetting {
  setting_key: string;
  setting_value: string;
}

interface ClientPortfolioRow {
  id: string;
  client_id: string;
  salesperson_id: string;
  last_purchase_date: string | null;
  status: string;
  updated_at: string;
  clients: { name: string }[] | null;
  salespeople: { name: string }[] | null;
}

interface SalespersonPerformance {
  id: string;
  name: string;
  total_sales: number;
  active_clients: number;
}

Deno.serve(withRequestId('auto-reassign-inactive', async (req, _ctx) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.info('[auto-reassign-inactive] Starting automatic reassignment check...');

    // Fetch portfolio settings
    const { data: settings, error: settingsError } = await supabase
      .from('portfolio_settings')
      .select('setting_key, setting_value')
      .limit(100);

    if (settingsError) {
      console.error('[auto-reassign-inactive] Error fetching settings:', settingsError);
      throw settingsError;
    }

    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: PortfolioSetting) => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    // Check if auto-reassign is enabled
    const autoReassign = settingsMap['auto_reassign_inactive'] === 'true';
    if (!autoReassign) {
      console.info('[auto-reassign-inactive] Auto-reassignment is disabled. Exiting.');
      return new Response(JSON.stringify({ 
        message: 'Auto-reassignment is disabled',
        reassigned: 0 
      }), {
        headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const inactivityThresholdDays = parseInt(settingsMap['inactivity_threshold_days'] || '365');
    const rotationStrategy = settingsMap['rotation_strategy'] || 'top_performer';
    const minDaysBeforeReassign = parseInt(settingsMap['min_days_before_reassign'] || '30');

    console.info(`[auto-reassign-inactive] Settings: threshold=${inactivityThresholdDays} days, strategy=${rotationStrategy}, minDays=${minDaysBeforeReassign}`);

    // Calculate cutoff dates
    const inactivityCutoff = new Date();
    inactivityCutoff.setDate(inactivityCutoff.getDate() - inactivityThresholdDays);

    const reassignCutoff = new Date();
    reassignCutoff.setDate(reassignCutoff.getDate() - minDaysBeforeReassign);

    // Find inactive clients eligible for reassignment
    const { data: inactiveClients, error: clientsError } = await supabase
      .from('client_portfolio')
      .select(`
        id,
        client_id,
        salesperson_id,
        last_purchase_date,
        status,
        updated_at,
        clients (name),
        salespeople (name)
      `)
      .eq('status', 'inactive')
      .lt('updated_at', reassignCutoff.toISOString())
      .limit(2000);

    if (clientsError) {
      console.error('[auto-reassign-inactive] Error fetching inactive clients:', clientsError);
      throw clientsError;
    }

    // Filter clients that have been inactive long enough
    const eligibleClients = (inactiveClients || []).filter((c: ClientPortfolioRow) => {
      if (!c.last_purchase_date) return true; // Never purchased
      return new Date(c.last_purchase_date) < inactivityCutoff;
    });

    console.info(`[auto-reassign-inactive] Found ${eligibleClients.length} eligible clients for reassignment`);

    if (eligibleClients.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No clients eligible for reassignment',
        reassigned: 0 
      }), {
        headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Fetch salespeople, recent sales, and active portfolios in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { data: salespeople, error: spError },
      { data: recentSales, error: salesError },
      { data: activePortfolios, error: portfolioError },
    ] = await Promise.all([
      supabase.from('salespeople').select('id, name, role, is_active').eq('is_active', true).in('role', ['closer', 'hybrid']).limit(500),
      supabase.from('sales').select('salesperson_id, amount').eq('status', 'completed').gte('created_at', thirtyDaysAgo.toISOString()).limit(10000),
      supabase.from('client_portfolio').select('salesperson_id').eq('status', 'active').limit(5000),
    ]);

    if (spError) throw spError;
    if (salesError) throw salesError;
    if (portfolioError) throw portfolioError;

    // Calculate performance metrics
    const performanceMap = new Map<string, SalespersonPerformance>();
    (salespeople || []).forEach((sp: { id: string; name: string }) => {
      performanceMap.set(sp.id, {
        id: sp.id,
        name: sp.name,
        total_sales: 0,
        active_clients: 0,
      });
    });

    (recentSales || []).forEach((sale: { salesperson_id: string; amount: number }) => {
      const perf = performanceMap.get(sale.salesperson_id);
      if (perf) perf.total_sales += Number(sale.amount);
    });

    (activePortfolios || []).forEach((p: { salesperson_id: string }) => {
      const perf = performanceMap.get(p.salesperson_id);
      if (perf) perf.active_clients++;
    });

    const rankedSalespeople = Array.from(performanceMap.values());

    // Sort based on strategy
    let sortedSalespeople: SalespersonPerformance[];
    switch (rotationStrategy) {
      case 'top_performer':
        sortedSalespeople = rankedSalespeople.sort((a, b) => b.total_sales - a.total_sales);
        break;
      case 'balanced_load':
        sortedSalespeople = rankedSalespeople.sort((a, b) => a.active_clients - b.active_clients);
        break;
      case 'round_robin':
      default:
        // Simple shuffle for round robin
        sortedSalespeople = rankedSalespeople.sort(() => Math.random() - 0.5);
        break;
    }

    console.info(`[auto-reassign-inactive] Using strategy: ${rotationStrategy}`);
    console.info(`[auto-reassign-inactive] Available salespeople:`, sortedSalespeople.map(s => `${s.name}(${s.total_sales})`));

    // Plan all assignments in memory first (no DB calls per iteration)
    const nowIso = new Date().toISOString();
    type Assignment = {
      client: ClientPortfolioRow;
      targetSp: SalespersonPerformance;
    };
    const assignments: Assignment[] = [];
    let spIndex = 0;

    for (const client of eligibleClients) {
      if (sortedSalespeople.length === 0) break;

      let targetSp = sortedSalespeople[spIndex % sortedSalespeople.length];
      if (targetSp.id === client.salesperson_id && sortedSalespeople.length > 1) {
        spIndex++;
        targetSp = sortedSalespeople[spIndex % sortedSalespeople.length];
      }
      if (targetSp.id === client.salesperson_id) continue;

      assignments.push({ client, targetSp });
      spIndex++;
    }

    // Batch 1: run all portfolio updates in parallel (each row changes a different salesperson_id)
    const updateResults = await Promise.all(
      assignments.map(({ client, targetSp }) =>
        supabase
          .from('client_portfolio')
          .update({ salesperson_id: targetSp.id, assigned_at: nowIso, updated_at: nowIso })
          .eq('id', client.id)
      )
    );
    const failedIds = new Set<string>();
    updateResults.forEach(({ error }, i) => {
      if (error) {
        console.error(`[auto-reassign-inactive] Error updating client ${assignments[i].client.id}:`, error);
        failedIds.add(assignments[i].client.id);
      }
    });

    // Batch 2: single insert for all routing log rows
    const logRows = assignments
      .filter(({ client }) => !failedIds.has(client.id))
      .map(({ client, targetSp }) => ({
        client_id: client.client_id,
        from_salesperson_id: client.salesperson_id,
        to_salesperson_id: targetSp.id,
        routing_reason: 'auto_reassign_inactive',
        notes: `Reatribuição automática por inatividade (${inactivityThresholdDays} dias). Estratégia: ${rotationStrategy}`,
      }));

    if (logRows.length > 0) {
      const { error: logError } = await supabase.from('lead_routing_log').insert(logRows);
      if (logError) console.error('[auto-reassign-inactive] Error batch-logging routing:', logError);
    }

    const reassignedCount = logRows.length;
    for (const { client, targetSp } of assignments.filter(a => !failedIds.has(a.client.id))) {
      const clientName = client.clients?.[0]?.name || client.client_id;
      const fromName = client.salespeople?.[0]?.name || 'Unknown';
      console.info(`[auto-reassign-inactive] Reassigned client ${clientName} from ${fromName} to ${targetSp.name}`);
    }

    console.info(`[auto-reassign-inactive] Completed. Reassigned ${reassignedCount} clients.`);

    return new Response(JSON.stringify({ 
      message: 'Auto-reassignment completed',
      reassigned: reassignedCount,
      strategy: rotationStrategy,
      threshold_days: inactivityThresholdDays,
    }), {
      headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[auto-reassign-inactive] Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
}));
