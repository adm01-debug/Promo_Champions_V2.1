import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BITRIX24_DOMAIN = Deno.env.get("BITRIX24_DOMAIN");
const BITRIX24_CLIENT_ID = Deno.env.get("BITRIX24_CLIENT_ID");
const BITRIX24_CLIENT_SECRET = Deno.env.get("BITRIX24_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface BitrixCompany {
  ID: string;
  TITLE: string;
  PHONE?: { VALUE: string }[];
  EMAIL?: { VALUE: string }[];
  UF_CRM_CAPITAL_SOCIAL?: string;
  UF_CRM_NUM_COLABORADORES?: string;
  UF_CRM_RAMO_ATIVIDADE?: string;
  UF_CRM_GRUPO_NICHO?: string;
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

    console.log("No access token found. OAuth2 authorization required.");
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

async function syncCompaniesToCRM(supabase: SupabaseClient) {
  console.log("Syncing companies from Bitrix24 to CRM...");
  
  try {
    const companies = await bitrixApiCall("crm.company.list", {
      select: ["ID", "TITLE", "PHONE", "EMAIL", "UF_CRM_CAPITAL_SOCIAL", "UF_CRM_NUM_COLABORADORES", "UF_CRM_RAMO_ATIVIDADE", "UF_CRM_GRUPO_NICHO"],
    }) as BitrixCompany[];

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

        await supabase
          .from("icp_data")
          .update({
            capital_social: company.UF_CRM_CAPITAL_SOCIAL ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL) : null,
            num_colaboradores: company.UF_CRM_NUM_COLABORADORES ? parseInt(company.UF_CRM_NUM_COLABORADORES) : null,
            ramo_atividade: company.UF_CRM_RAMO_ATIVIDADE,
            grupo_nicho: company.UF_CRM_GRUPO_NICHO,
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
          await supabase.from("icp_data").insert({
            client_id: newClient.id,
            bitrix_id: company.ID,
            capital_social: company.UF_CRM_CAPITAL_SOCIAL ? parseFloat(company.UF_CRM_CAPITAL_SOCIAL) : null,
            num_colaboradores: company.UF_CRM_NUM_COLABORADORES ? parseInt(company.UF_CRM_NUM_COLABORADORES) : null,
            ramo_atividade: company.UF_CRM_RAMO_ATIVIDADE,
            grupo_nicho: company.UF_CRM_GRUPO_NICHO,
          });
        }
      }
    }

    console.log(`Synced ${companies.length} companies from Bitrix24`);
    return companies.length;
  } catch (error) {
    console.error("Error syncing companies:", error);
    throw error;
  }
}

async function syncDealsFromBitrix(supabase: SupabaseClient) {
  console.log("Syncing deals from Bitrix24 to CRM...");
  
  try {
    const deals = await bitrixApiCall("crm.deal.list", {
      select: ["ID", "TITLE", "COMPANY_ID", "CONTACT_ID", "OPPORTUNITY", "STAGE_ID"],
    }) as BitrixDeal[];

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

    console.log(`Synced ${deals.length} deals from Bitrix24`);
    return deals.length;
  } catch (error) {
    console.error("Error syncing deals:", error);
    throw error;
  }
}

async function syncCompaniesToBitrix(supabase: SupabaseClient) {
  console.log("Syncing companies from CRM to Bitrix24...");
  
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
            UF_CRM_RAMO_ATIVIDADE: icp?.ramo_atividade,
            UF_CRM_GRUPO_NICHO: icp?.grupo_nicho,
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

    console.log(`Synced ${syncedCount} companies to Bitrix24`);
    return syncedCount;
  } catch (error) {
    console.error("Error syncing companies to Bitrix24:", error);
    throw error;
  }
}

async function syncDealsToBitrix(supabase: SupabaseClient) {
  console.log("Syncing deals from CRM to Bitrix24...");
  
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

    console.log(`Synced ${syncedCount} deals to Bitrix24`);
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

  try {
    if (!BITRIX24_DOMAIN || !BITRIX24_CLIENT_ID || !BITRIX24_CLIENT_SECRET) {
      throw new Error("Bitrix24 credentials not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action } = await req.json().catch(() => ({ action: "sync-all" }));

    let result: Record<string, number> = {};

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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bitrix24 sync completed",
        result,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bitrix24 sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
