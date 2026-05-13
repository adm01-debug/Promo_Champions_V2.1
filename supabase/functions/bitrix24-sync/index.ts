import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const BITRIX24_DOMAIN = Deno.env.get("BITRIX24_DOMAIN");
const BITRIX24_CLIENT_ID = Deno.env.get("BITRIX24_CLIENT_ID");
const BITRIX24_CLIENT_SECRET = Deno.env.get("BITRIX24_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Bitrix24 Custom Field IDs (from user's Bitrix24 configuration)
const BITRIX_FIELD_RAMO_ATIVIDADE = 'UF_CRM_1590780873288';
const BITRIX_FIELD_NICHO_SEGMENTO = 'UF_CRM_1631795570468';

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

async function logSyncResult(supabase: SupabaseClient, logData: SyncLogData) {
  try {
    await supabase.from("bitrix24_sync_logs").insert(logData);
    console.info("Sync log saved:", logData);
  } catch (error) {
    console.error("Error saving sync log:", error);
  }
}

async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { data: tokenData } = await supabase
      .from("portfolio_settings")
      .select("setting_value")
      .eq("setting_key", "bitrix24_access_token")
      .single();

    if (tokenData?.setting_value) {
      return tokenData.setting_value;
    }

    console.info("No access token found. OAuth2 authorization required.");
    return null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

async function bitrixApiCall(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("No valid access token available");
  }

  const url = `https://${BITRIX24_DOMAIN}/rest/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bitrix24 API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.result;
}

async function syncCompaniesToCRM(supabase: SupabaseClient): Promise<number> {
  console.info("Syncing companies from Bitrix24 to CRM...");
  
  try {
    const companies = await bitrixApiCall("crm.company.list", {
      select: ["ID", "TITLE", "PHONE", "EMAIL", "UF_CRM_CAPITAL_SOCIAL", "UF_CRM_NUM_COLABORADORES", BITRIX_FIELD_RAMO_ATIVIDADE, BITRIX_FIELD_NICHO_SEGMENTO],
    }) as BitrixCompany[];

    if (!companies || !Array.isArray(companies)) {
      console.info("No companies returned from Bitrix24");
      return 0;
    }

    for (const company of companies) {
      const phone = company.PHONE?.[0]?.VALUE || null;
      const email = company.EMAIL?.[0]?.VALUE || null;

      const { data: existingIcp } = await supabase
        .from("icp_data")
        .select("client_id")
        .eq("bitrix_id", company.ID)
        .single();

      if (existingIcp?.client_id) {
        await supabase
          .from("clients")
          .update({
            name: company.TITLE,
            phone,
            email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingIcp.client_id);

        const ramoAtividade = company[BITRIX_FIELD_RAMO_ATIVIDADE] as string || null;
        const grupoNicho = company[BITRIX_FIELD_NICHO_SEGMENTO] as string || null;
        
        // Auto-validate ICP: true if both ramo_atividade and grupo_nicho are filled
        const isIcpMatch = !!(ramoAtividade && grupoNicho);

        await supabase
          .from("icp_data")
          .update({
            capital_social: company.UF_CRM_CAPITAL_SOCIAL ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL as string) : null,
            num_colaboradores: company.UF_CRM_NUM_COLABORADORES ? parseInt(company.UF_CRM_NUM_COLABORADORES as string) : null,
            ramo_atividade: ramoAtividade,
            grupo_nicho: grupoNicho,
            is_icp_match: isIcpMatch,
            updated_at: new Date().toISOString(),
          })
          .eq("bitrix_id", company.ID);
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            name: company.TITLE,
            phone,
            email,
            company: company.TITLE,
          })
          .select("id")
          .single();

        if (newClient?.id) {
          const ramoAtividade = company[BITRIX_FIELD_RAMO_ATIVIDADE] as string || null;
          const grupoNicho = company[BITRIX_FIELD_NICHO_SEGMENTO] as string || null;
          const isIcpMatch = !!(ramoAtividade && grupoNicho);

          await supabase.from("icp_data").insert({
            client_id: newClient.id,
            bitrix_id: company.ID,
            capital_social: company.UF_CRM_CAPITAL_SOCIAL ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL as string) : null,
            num_colaboradores: company.UF_CRM_NUM_COLABORADORES ? parseInt(company.UF_CRM_NUM_COLABORADORES as string) : null,
            ramo_atividade: ramoAtividade,
            grupo_nicho: grupoNicho,
            is_icp_match: isIcpMatch,
          });
        }
      }
    }

    console.info(`Synced ${companies.length} companies from Bitrix24`);
    return companies.length;
  } catch (error) {
    console.error("Error syncing companies:", error);
    throw error;
  }
}

async function syncDealsFromBitrix(supabase: SupabaseClient): Promise<number> {
  console.info("Syncing deals from Bitrix24 to CRM...");
  
  try {
    const deals = await bitrixApiCall("crm.deal.list", {
      select: ["ID", "TITLE", "COMPANY_ID", "CONTACT_ID", "OPPORTUNITY", "STAGE_ID"],
    }) as BitrixDeal[];

    if (!deals || !Array.isArray(deals)) {
      console.info("No deals returned from Bitrix24");
      return 0;
    }

    const stageMapping: Record<string, string> = {
      "NEW": "lead",
      "PREPARATION": "qualified",
      "PREPAYMENT_INVOICE": "proposal",
      "EXECUTING": "negotiation",
      "FINAL_INVOICE": "negotiation",
      "WON": "completed",
      "LOSE": "lost",
    };

    for (const deal of deals) {
      let clientName = deal.TITLE;
      
      if (deal.COMPANY_ID) {
        const { data: client } = await supabase
          .from("clients")
          .select("name, icp_data!inner(bitrix_id)")
          .eq("icp_data.bitrix_id", deal.COMPANY_ID)
          .single();
        
        if (client?.name) {
          clientName = client.name;
        }
      }

      const status = stageMapping[deal.STAGE_ID || "NEW"] || "lead";
      const amount = deal.OPPORTUNITY ? parseFloat(deal.OPPORTUNITY) : 0;

      const { data: existingSale } = await supabase
        .from("sales")
        .select("id")
        .eq("client_name", clientName)
        .eq("product_name", deal.TITLE)
        .single();

      if (existingSale?.id) {
        await supabase
          .from("sales")
          .update({
            amount,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSale.id);
      } else {
        await supabase.from("sales").insert({
          client_name: clientName,
          product_name: deal.TITLE,
          amount,
          status,
          source: "bitrix24",
        });
      }
    }

    console.info(`Synced ${deals.length} deals from Bitrix24`);
    return deals.length;
  } catch (error) {
    console.error("Error syncing deals:", error);
    throw error;
  }
}

async function syncCompaniesToBitrix(supabase: SupabaseClient): Promise<number> {
  console.info("Syncing companies from CRM to Bitrix24...");
  
  try {
    const { data: clientsWithoutBitrix } = await supabase
      .from("clients")
      .select("id, name, email, phone, company");

    if (!clientsWithoutBitrix) return 0;

    const clientIds = clientsWithoutBitrix.map(c => c.id);
    
    const { data: icpDataList } = await supabase
      .from("icp_data")
      .select("client_id, bitrix_id, capital_social, num_colaboradores, ramo_atividade, grupo_nicho")
      .in("client_id", clientIds);

    const icpMap = new Map<string, IcpData>();
    icpDataList?.forEach(icp => {
      icpMap.set(icp.client_id, icp);
    });

    const clientsToSync = clientsWithoutBitrix.filter(client => {
      const icp = icpMap.get(client.id);
      return !icp?.bitrix_id;
    });

    let syncedCount = 0;
    for (const client of clientsToSync) {
      try {
        const icp = icpMap.get(client.id);
        
        const result = await bitrixApiCall("crm.company.add", {
          fields: {
            TITLE: client.company || client.name,
            PHONE: client.phone ? [{ VALUE: client.phone, VALUE_TYPE: "WORK" }] : [],
            EMAIL: client.email ? [{ VALUE: client.email, VALUE_TYPE: "WORK" }] : [],
            UF_CRM_CAPITAL_SOCIAL: icp?.capital_social?.toString(),
            UF_CRM_NUM_COLABORADORES: icp?.num_colaboradores?.toString(),
            [BITRIX_FIELD_RAMO_ATIVIDADE]: icp?.ramo_atividade,
            [BITRIX_FIELD_NICHO_SEGMENTO]: icp?.grupo_nicho,
          },
        }) as string;

        if (result) {
          if (icp) {
            await supabase
              .from("icp_data")
              .update({ bitrix_id: result })
              .eq("client_id", client.id);
          } else {
            await supabase.from("icp_data").insert({
              client_id: client.id,
              bitrix_id: result,
            });
          }
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error syncing client ${client.id} to Bitrix24:`, error);
      }
    }

    console.info(`Synced ${syncedCount} companies to Bitrix24`);
    return syncedCount;
  } catch (error) {
    console.error("Error syncing companies to Bitrix24:", error);
    throw error;
  }
}

async function syncDealsToBitrix(supabase: SupabaseClient): Promise<number> {
  console.info("Syncing deals from CRM to Bitrix24...");
  
  try {
    const statusMapping: Record<string, string> = {
      "lead": "NEW",
      "qualified": "PREPARATION",
      "proposal": "PREPAYMENT_INVOICE",
      "negotiation": "EXECUTING",
      "completed": "WON",
      "lost": "LOSE",
    };

    const { data: sales } = await supabase
      .from("sales")
      .select("id, client_name, product_name, amount, status")
      .neq("source", "bitrix24")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (!sales) return 0;

    let syncedCount = 0;
    for (const sale of sales) {
      try {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("name", sale.client_name)
          .single();

        let companyId: string | undefined;
        if (client?.id) {
          const { data: icpData } = await supabase
            .from("icp_data")
            .select("bitrix_id")
            .eq("client_id", client.id)
            .single();
          
          companyId = icpData?.bitrix_id || undefined;
        }

        await bitrixApiCall("crm.deal.add", {
          fields: {
            TITLE: sale.product_name,
            OPPORTUNITY: sale.amount,
            STAGE_ID: statusMapping[sale.status] || "NEW",
            COMPANY_ID: companyId,
          },
        });

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing sale ${sale.id} to Bitrix24:`, error);
      }
    }

    console.info(`Synced ${syncedCount} deals to Bitrix24`);
    return syncedCount;
  } catch (error) {
    console.error("Error syncing deals to Bitrix24:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    if (!BITRIX24_DOMAIN || !BITRIX24_CLIENT_ID || !BITRIX24_CLIENT_SECRET) {
      throw new Error("Bitrix24 credentials not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync-all";
    const triggeredBy = body.triggered_by || "manual";

    let result: Record<string, number> = {
      companiesFromBitrix: 0,
      dealsFromBitrix: 0,
      companiesToBitrix: 0,
      dealsToBitrix: 0,
    };

    switch (action) {
      case "sync-companies-from-bitrix":
        result.companiesFromBitrix = await syncCompaniesToCRM(supabase);
        break;
      case "sync-companies-to-bitrix":
        result.companiesToBitrix = await syncCompaniesToBitrix(supabase);
        break;
      case "sync-deals-from-bitrix":
        result.dealsFromBitrix = await syncDealsFromBitrix(supabase);
        break;
      case "sync-deals-to-bitrix":
        result.dealsToBitrix = await syncDealsToBitrix(supabase);
        break;
      case "sync-all":
      default:
        result = {
          companiesFromBitrix: await syncCompaniesToCRM(supabase),
          dealsFromBitrix: await syncDealsFromBitrix(supabase),
          companiesToBitrix: await syncCompaniesToBitrix(supabase),
          dealsToBitrix: await syncDealsToBitrix(supabase),
        };
        break;
    }

    const durationMs = Date.now() - startTime;

    // Log successful sync
    await logSyncResult(supabase, {
      sync_type: action,
      status: "success",
      companies_from_bitrix: result.companiesFromBitrix,
      companies_to_bitrix: result.companiesToBitrix,
      deals_from_bitrix: result.dealsFromBitrix,
      deals_to_bitrix: result.dealsToBitrix,
      duration_ms: durationMs,
      triggered_by: triggeredBy,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bitrix24 sync completed",
        result,
        duration_ms: durationMs,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("Bitrix24 sync error:", error);

    // Log failed sync
    try {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      const body = await req.clone().json().catch(() => ({}));
      
      await logSyncResult(supabase, {
        sync_type: body.action || "sync-all",
        status: "error",
        companies_from_bitrix: 0,
        companies_to_bitrix: 0,
        deals_from_bitrix: 0,
        deals_to_bitrix: 0,
        error_message: errorMessage,
        duration_ms: durationMs,
        triggered_by: body.triggered_by || "manual",
      });
    } catch (logError) {
      console.error("Error logging sync failure:", logError);
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
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
