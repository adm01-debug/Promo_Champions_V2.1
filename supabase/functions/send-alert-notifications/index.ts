import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { differenceInDays } from "https://esm.sh/date-fns@3.6.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGNANT_CRITICAL_DAYS = 14;
const INACTIVE_CLIENT_CRITICAL_DAYS = 60;

interface Alert {
  type: string;
  severity: string;
  title: string;
  description: string;
  amount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail } = await req.json();

    if (!recipientEmail) {
      throw new Error("recipientEmail is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const criticalAlerts: Alert[] = [];
    const now = new Date();

    // Check for critical stagnant deals (14+ days)
    const { data: pendingDeals } = await supabase
      .from("sales")
      .select("*")
      .in("status", ["pending", "in_progress", "negotiation", "proposal"]);

    pendingDeals?.forEach((deal) => {
      const updatedAt = new Date(deal.updated_at);
      const daysSinceUpdate = differenceInDays(now, updatedAt);

      if (daysSinceUpdate >= STAGNANT_CRITICAL_DAYS) {
        criticalAlerts.push({
          type: "stagnant_deal",
          severity: "critical",
          title: "🚨 Deal Crítico Parado",
          description: `${deal.client_name} - ${deal.product_name} (${daysSinceUpdate} dias sem atualização)`,
          amount: Number(deal.amount),
        });
      }
    });

    // Check for critical inactive clients (60+ days)
    const { data: allSales } = await supabase
      .from("sales")
      .select("client_name, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    const clientLastSale: Record<string, Date> = {};
    allSales?.forEach((sale) => {
      if (!clientLastSale[sale.client_name]) {
        clientLastSale[sale.client_name] = new Date(sale.created_at);
      }
    });

    Object.entries(clientLastSale).forEach(([clientName, lastSaleDate]) => {
      const daysSinceLastSale = differenceInDays(now, lastSaleDate);
      if (daysSinceLastSale >= INACTIVE_CLIENT_CRITICAL_DAYS) {
        criticalAlerts.push({
          type: "inactive_client",
          severity: "critical",
          title: "⚠️ Cliente Inativo Crítico",
          description: `${clientName} - última compra há ${daysSinceLastSale} dias`,
        });
      }
    });

    // Check for critical at-risk goals (40%+ behind expected)
    const { data: salespeople } = await supabase
      .from("salespeople")
      .select("id, name")
      .eq("is_active", true);

    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
    const { data: goals } = await supabase
      .from("sales_goals")
      .select("*")
      .eq("month", currentMonth);

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const expectedProgress = (dayOfMonth / daysInMonth) * 100;

    for (const person of salespeople || []) {
      const goal = goals?.find((g) => g.salesperson_id === person.id);
      if (!goal) continue;

      const { data: sales } = await supabase
        .from("sales")
        .select("amount")
        .eq("salesperson_id", person.id)
        .eq("status", "completed")
        .gte("created_at", currentMonth);

      const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const actualProgress = (totalSales / Number(goal.goal_amount)) * 100;

      if (actualProgress < expectedProgress - 40) {
        criticalAlerts.push({
          type: "at_risk_goal",
          severity: "critical",
          title: "📉 Meta em Risco Crítico",
          description: `${person.name} - ${actualProgress.toFixed(0)}% vs ${expectedProgress.toFixed(0)}% esperado`,
        });
      }
    }

    if (criticalAlerts.length === 0) {
      console.log("No critical alerts to send");
      return new Response(
        JSON.stringify({ message: "No critical alerts found", alertsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build email HTML
    const alertsHtml = criticalAlerts
      .map(
        (alert) => `
        <div style="background: #1a1a2e; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 12px; border-radius: 8px;">
          <h3 style="color: #f97316; margin: 0 0 8px 0;">${alert.title}</h3>
          <p style="color: #e2e8f0; margin: 0;">${alert.description}</p>
          ${alert.amount ? `<p style="color: #94a3b8; margin: 8px 0 0 0;">Valor: R$ ${alert.amount.toLocaleString("pt-BR")}</p>` : ""}
        </div>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alertas Críticos - Sistema de Vendas</title>
        </head>
        <body style="background: #0f0f23; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Alertas Críticos</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${criticalAlerts.length} alerta(s) requerem atenção imediata</p>
            </div>
            <div style="background: #16162a; padding: 24px; border-radius: 0 0 12px 12px;">
              ${alertsHtml}
              <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">
                Enviado automaticamente pelo Sistema de Vendas • ${new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Alertas <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `🚨 ${criticalAlerts.length} Alerta(s) Crítico(s) - Ação Necessária`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Critical alerts sent successfully", 
        alertsSent: criticalAlerts.length,
        emailResponse 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-alert-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
