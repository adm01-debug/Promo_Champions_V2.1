import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { isInternalServiceRequest } from "../_shared/internal-service-auth.ts";

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

const REASSIGNMENT_BATCH_SIZE = 20;

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseBoundedPositiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3650) {
    throw new Error(`Configuração inválida para ${name}`);
  }

  return parsed;
}

Deno.serve(withRequestId("auto-reassign-inactive", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // Este job usa service_role para alterar carteira; um JWT de usuário não é
  // suficiente para dispará-lo nem para assumir seus privilégios.
  if (!isInternalServiceRequest(req)) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return json({ error: "service_not_configured" }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.info(
      "[auto-reassign-inactive] Starting automatic reassignment check...",
    );

    // Fetch portfolio settings
    const { data: settings, error: settingsError } = await supabase
      .from("portfolio_settings")
      .select("setting_key, setting_value")
      .limit(100);

    if (settingsError) {
      console.error(
        "[auto-reassign-inactive] Error fetching settings:",
        settingsError,
      );
      throw settingsError;
    }

    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: PortfolioSetting) => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    // Check if auto-reassign is enabled
    const autoReassign = settingsMap["auto_reassign_inactive"] === "true";
    if (!autoReassign) {
      console.info(
        "[auto-reassign-inactive] Auto-reassignment is disabled. Exiting.",
      );
      return json({
        message: "Auto-reassignment is disabled",
        reassigned: 0,
      });
    }

    const inactivityThresholdDays = parseBoundedPositiveInteger(
      settingsMap["inactivity_threshold_days"],
      365,
      "inactivity_threshold_days",
    );
    const rotationStrategy = settingsMap["rotation_strategy"] ||
      "top_performer";
    const minDaysBeforeReassign = parseBoundedPositiveInteger(
      settingsMap["min_days_before_reassign"],
      30,
      "min_days_before_reassign",
    );

    console.info(
      `[auto-reassign-inactive] Settings: threshold=${inactivityThresholdDays} days, strategy=${rotationStrategy}, minDays=${minDaysBeforeReassign}`,
    );

    // Calculate cutoff dates
    const inactivityCutoff = new Date();
    inactivityCutoff.setDate(
      inactivityCutoff.getDate() - inactivityThresholdDays,
    );

    const reassignCutoff = new Date();
    reassignCutoff.setDate(reassignCutoff.getDate() - minDaysBeforeReassign);

    // Find inactive clients eligible for reassignment
    const { data: inactiveClients, error: clientsError } = await supabase
      .from("client_portfolio")
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
      .eq("status", "inactive")
      .lt("updated_at", reassignCutoff.toISOString())
      .limit(2000);

    if (clientsError) {
      console.error(
        "[auto-reassign-inactive] Error fetching inactive clients:",
        clientsError,
      );
      throw clientsError;
    }

    // Filter clients that have been inactive long enough
    const eligibleClients = (inactiveClients || []).filter(
      (c: ClientPortfolioRow) => {
        if (!c.last_purchase_date) return true; // Never purchased
        return new Date(c.last_purchase_date) < inactivityCutoff;
      },
    );

    console.info(
      `[auto-reassign-inactive] Found ${eligibleClients.length} eligible clients for reassignment`,
    );

    if (eligibleClients.length === 0) {
      return json({
        message: "No clients eligible for reassignment",
        reassigned: 0,
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
      supabase.from("salespeople").select("id, name, role, is_active").eq(
        "is_active",
        true,
      ).in("role", ["closer", "hybrid"]).limit(500),
      supabase.from("sales").select("salesperson_id, amount").eq(
        "status",
        "completed",
      ).gte("created_at", thirtyDaysAgo.toISOString()).limit(10000),
      supabase.from("client_portfolio").select("salesperson_id").eq(
        "status",
        "active",
      ).limit(5000),
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

    (recentSales || []).forEach(
      (sale: { salesperson_id: string; amount: number }) => {
        const perf = performanceMap.get(sale.salesperson_id);
        if (perf) perf.total_sales += Number(sale.amount);
      },
    );

    (activePortfolios || []).forEach((p: { salesperson_id: string }) => {
      const perf = performanceMap.get(p.salesperson_id);
      if (perf) perf.active_clients++;
    });

    const rankedSalespeople = Array.from(performanceMap.values());

    // Sort based on strategy
    let sortedSalespeople: SalespersonPerformance[];
    switch (rotationStrategy) {
      case "top_performer":
        sortedSalespeople = rankedSalespeople.sort((a, b) =>
          b.total_sales - a.total_sales
        );
        break;
      case "balanced_load":
        sortedSalespeople = rankedSalespeople.sort((a, b) =>
          a.active_clients - b.active_clients
        );
        break;
      case "round_robin":
      default:
        // Simple shuffle for round robin
        sortedSalespeople = rankedSalespeople.sort(() => Math.random() - 0.5);
        break;
    }

    console.info(
      `[auto-reassign-inactive] Using strategy: ${rotationStrategy}`,
    );
    console.info(
      `[auto-reassign-inactive] Available salespeople:`,
      sortedSalespeople.map((s) => `${s.name}(${s.total_sales})`),
    );

    // Planeja os destinos antes de executar as RPCs atômicas em lotes.
    type Assignment = {
      client: ClientPortfolioRow;
      targetSp: SalespersonPerformance;
    };
    const assignments: Assignment[] = [];
    let spIndex = 0;

    for (const client of eligibleClients) {
      if (sortedSalespeople.length === 0) break;

      let targetSp = sortedSalespeople[spIndex % sortedSalespeople.length];
      if (
        targetSp.id === client.salesperson_id && sortedSalespeople.length > 1
      ) {
        spIndex++;
        targetSp = sortedSalespeople[spIndex % sortedSalespeople.length];
      }
      if (targetSp.id === client.salesperson_id) continue;

      assignments.push({ client, targetSp });
      spIndex++;
    }

    // A RPC bloqueia a linha e compara o estado observado antes de gravar.
    // Assim, duas execuções concorrentes não conseguem alterar a mesma
    // carteira nem deixar uma reatribuição sem seu log de auditoria.
    const successfulAssignments: Assignment[] = [];
    for (
      let start = 0;
      start < assignments.length;
      start += REASSIGNMENT_BATCH_SIZE
    ) {
      const batch = assignments.slice(start, start + REASSIGNMENT_BATCH_SIZE);
      const results = await Promise.all(batch.map(async (assignment) => {
        const { data, error } = await supabase.rpc(
          "reassign_inactive_client_portfolio",
          {
            p_portfolio_id: assignment.client.id,
            p_expected_salesperson_id: assignment.client.salesperson_id,
            p_expected_updated_at: assignment.client.updated_at,
            p_to_salesperson_id: assignment.targetSp.id,
            p_inactivity_threshold_days: inactivityThresholdDays,
            p_strategy: rotationStrategy,
          },
        );

        if (error || !data?.length) {
          console.warn(
            `[auto-reassign-inactive] Carteira ${assignment.client.id} não foi reatribuída:`,
            error?.message || "resultado vazio",
          );
          return null;
        }

        return assignment;
      }));

      successfulAssignments.push(
        ...results.filter((result): result is Assignment => result !== null),
      );
    }

    const reassignedCount = successfulAssignments.length;
    for (const { client, targetSp } of successfulAssignments) {
      const clientName = client.clients?.[0]?.name || client.client_id;
      const fromName = client.salespeople?.[0]?.name || "Unknown";
      console.info(
        `[auto-reassign-inactive] Reassigned client ${clientName} from ${fromName} to ${targetSp.name}`,
      );
    }

    console.info(
      `[auto-reassign-inactive] Completed. Reassigned ${reassignedCount} clients.`,
    );

    return json({
      message: "Auto-reassignment completed",
      reassigned: reassignedCount,
      strategy: rotationStrategy,
      threshold_days: inactivityThresholdDays,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[auto-reassign-inactive] Error:", message);
    return json({ error: message }, 500);
  }
}));
