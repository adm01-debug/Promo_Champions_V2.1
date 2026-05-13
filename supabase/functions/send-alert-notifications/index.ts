import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { differenceInDays } from "https://esm.sh/date-fns@3.6.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface Alert {
  type: string;
  severity: string;
  title: string;
  description: string;
  amount?: number;
}

interface NotificationPreference {
  id: string;
  email: string;
  is_active: boolean;
  frequency: string;
  notify_stagnant_deals: boolean;
  notify_inactive_clients: boolean;
  notify_at_risk_goals: boolean;
  stagnant_threshold_days: number;
  inactive_threshold_days: number;
  preferred_time: string;
}

const buildEmailHtml = (alerts: Alert[]) => {
  const alertsHtml = alerts
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

  return `
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
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${alerts.length} alerta(s) requerem atenção imediata</p>
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
};

const generateAlerts = async (supabase: any, pref: NotificationPreference): Promise<Alert[]> => {
  const alerts: Alert[] = [];
  const now = new Date();

  // Check for stagnant deals
  if (pref.notify_stagnant_deals) {
    const { data: pendingDeals } = await supabase
      .from("sales")
      .select("*")
      .in("status", ["pending", "in_progress", "negotiation", "proposal"]);

    pendingDeals?.forEach((deal: any) => {
      const updatedAt = new Date(deal.updated_at);
      const daysSinceUpdate = differenceInDays(now, updatedAt);

      if (daysSinceUpdate >= pref.stagnant_threshold_days) {
        alerts.push({
          type: "stagnant_deal",
          severity: "critical",
          title: "🚨 Deal Crítico Parado",
          description: `${deal.client_name} - ${deal.product_name} (${daysSinceUpdate} dias sem atualização)`,
          amount: Number(deal.amount),
        });
      }
    });
  }

  // Check for inactive clients
  if (pref.notify_inactive_clients) {
    const { data: allSales } = await supabase
      .from("sales")
      .select("client_name, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    const clientLastSale: Record<string, Date> = {};
    allSales?.forEach((sale: any) => {
      if (!clientLastSale[sale.client_name]) {
        clientLastSale[sale.client_name] = new Date(sale.created_at);
      }
    });

    Object.entries(clientLastSale).forEach(([clientName, lastSaleDate]) => {
      const daysSinceLastSale = differenceInDays(now, lastSaleDate);
      if (daysSinceLastSale >= pref.inactive_threshold_days) {
        alerts.push({
          type: "inactive_client",
          severity: "critical",
          title: "⚠️ Cliente Inativo Crítico",
          description: `${clientName} - última compra há ${daysSinceLastSale} dias`,
        });
      }
    });
  }

  // Check for at-risk goals
  if (pref.notify_at_risk_goals) {
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
      const goal = goals?.find((g: any) => g.salesperson_id === person.id);
      if (!goal) continue;

      const { data: sales } = await supabase
        .from("sales")
        .select("amount")
        .eq("salesperson_id", person.id)
        .eq("status", "completed")
        .gte("created_at", currentMonth);

      const totalSales = sales?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0;
      const actualProgress = (totalSales / Number(goal.goal_amount)) * 100;

      if (actualProgress < expectedProgress - 40) {
        alerts.push({
          type: "at_risk_goal",
          severity: "critical",
          title: "📉 Meta em Risco Crítico",
          description: `${person.name} - ${actualProgress.toFixed(0)}% vs ${expectedProgress.toFixed(0)}% esperado`,
        });
      }
    }
  }

  return alerts;
};

const logEmailToDatabase = async (
  supabase: any,
  email: string,
  subject: string,
  status: 'sent' | 'failed',
  alertsCount: number,
  alerts: Alert[],
  errorMessage?: string
) => {
  try {
    await supabase.from('email_logs').insert({
      function_name: 'send-alert-notifications',
      recipient_email: email,
      subject,
      status,
      error_message: errorMessage || null,
      metadata: {
        alerts_count: alertsCount,
        alert_types: alerts.map(a => a.type),
        alerts_summary: alerts.map(a => ({
          type: a.type,
          title: a.title,
          amount: a.amount,
        })),
      },
    });
  } catch (logError) {
    console.error('Failed to log email to database:', logError);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recipientEmail: string | null = null;
    let isCronJob = false;

    // Check if this is a CRON job (empty body) or manual trigger
    try {
      const body = await req.json();
      recipientEmail = body.recipientEmail;
    } catch {
      // Empty body means CRON job trigger
      isCronJob = true;
    }

    const results: { email: string; alertsSent: number; success: boolean; error?: string }[] = [];

    if (isCronJob) {
      // Fetch all active notification preferences
      const { data: preferences, error: prefError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("is_active", true);

      if (prefError) {
        throw new Error(`Failed to fetch preferences: ${prefError.message}`);
      }

      if (!preferences || preferences.length === 0) {
        console.info("No active notification preferences found");
        return new Response(
          JSON.stringify({ message: "No active notification preferences", emailsSent: 0 }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.info(`Processing ${preferences.length} notification preferences`);

      for (const pref of preferences as NotificationPreference[]) {
        try {
          const alerts = await generateAlerts(supabase, pref);

          if (alerts.length === 0) {
            results.push({ email: pref.email, alertsSent: 0, success: true });
            continue;
          }

          const subject = `🚨 ${alerts.length} Alerta(s) Crítico(s) - Ação Necessária`;
          const emailHtml = buildEmailHtml(alerts);

          try {
            const emailResponse = await resend.emails.send({
              from: "Alertas <onboarding@resend.dev>",
              to: [pref.email],
              subject,
              html: emailHtml,
            });

            console.info(`Email sent to ${pref.email}:`, emailResponse);
            await logEmailToDatabase(supabase, pref.email, subject, 'sent', alerts.length, alerts);
            results.push({ email: pref.email, alertsSent: alerts.length, success: true });
          } catch (emailError: any) {
            console.error(`Error sending to ${pref.email}:`, emailError);
            await logEmailToDatabase(supabase, pref.email, subject, 'failed', alerts.length, alerts, emailError.message);
            results.push({ email: pref.email, alertsSent: 0, success: false, error: emailError.message });
          }
        } catch (error: any) {
          console.error(`Error processing ${pref.email}:`, error);
          results.push({ email: pref.email, alertsSent: 0, success: false, error: error.message });
        }
      }

      const totalSent = results.filter(r => r.success && r.alertsSent > 0).length;
      return new Response(
        JSON.stringify({
          message: `CRON job completed. Sent to ${totalSent}/${preferences.length} recipients`,
          results,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // Manual trigger with specific email
      if (!recipientEmail) {
        throw new Error("recipientEmail is required for manual trigger");
      }

      // Use default thresholds for manual trigger
      const defaultPref: NotificationPreference = {
        id: "manual",
        email: recipientEmail,
        is_active: true,
        frequency: "daily",
        notify_stagnant_deals: true,
        notify_inactive_clients: true,
        notify_at_risk_goals: true,
        stagnant_threshold_days: 14,
        inactive_threshold_days: 60,
        preferred_time: "08:00",
      };

      const alerts = await generateAlerts(supabase, defaultPref);

      if (alerts.length === 0) {
        console.info("No critical alerts to send");
        return new Response(
          JSON.stringify({ message: "No critical alerts found", alertsSent: 0 }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const subject = `🚨 ${alerts.length} Alerta(s) Crítico(s) - Ação Necessária`;
      const emailHtml = buildEmailHtml(alerts);

      try {
        const emailResponse = await resend.emails.send({
          from: "Alertas <onboarding@resend.dev>",
          to: [recipientEmail],
          subject,
          html: emailHtml,
        });

        console.info("Email sent successfully:", emailResponse);
        await logEmailToDatabase(supabase, recipientEmail, subject, 'sent', alerts.length, alerts);

        return new Response(
          JSON.stringify({
            message: "Critical alerts sent successfully",
            alertsSent: alerts.length,
            emailResponse,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        await logEmailToDatabase(supabase, recipientEmail, subject, 'failed', alerts.length, alerts, emailError.message);

        return new Response(
          JSON.stringify({
            message: "Failed to send email",
            error: emailError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }
  } catch (error: any) {
    console.error("Error in send-alert-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
