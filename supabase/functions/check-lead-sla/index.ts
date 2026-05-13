import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface LeadSLAViolation {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  hours_since_contact: number;
  salesperson_name: string;
  salesperson_email: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info("Starting SLA check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get SLA thresholds from request or use defaults
    let warningHours = 4;
    let criticalHours = 8;
    let notifyEmail = "";

    try {
      const body = await req.json();
      warningHours = body.warningHours || 4;
      criticalHours = body.criticalHours || 8;
      notifyEmail = body.notifyEmail || "";
    } catch {
      // Use defaults if no body
    }

    // Fetch active leads
    const { data: leads, error: leadsError } = await supabase
      .from("sales")
      .select(`
        id,
        client_name,
        product_name,
        amount,
        status,
        created_at,
        salesperson_id,
        salespeople (
          id,
          name,
          email
        )
      `)
      .not("status", "in", "(completed,lost)");

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    // Fetch latest activity for each lead
    const { data: activities, error: actError } = await supabase
      .from("activities")
      .select("sale_id, created_at")
      .order("created_at", { ascending: false });

    if (actError) {
      console.error("Error fetching activities:", actError);
      throw actError;
    }

    // Build activity map
    const latestActivityMap = new Map<string, string>();
    for (const act of activities || []) {
      if (act.sale_id && !latestActivityMap.has(act.sale_id)) {
        latestActivityMap.set(act.sale_id, act.created_at);
      }
    }

    const now = new Date();
    const violations: LeadSLAViolation[] = [];

    for (const lead of leads || []) {
      const lastActivityAt = latestActivityMap.get(lead.id);
      const referenceTime = lastActivityAt || lead.created_at;
      const hoursSinceContact = Math.floor(
        (now.getTime() - new Date(referenceTime).getTime()) / (1000 * 60 * 60)
      );

      if (hoursSinceContact >= criticalHours) {
        const salesperson = Array.isArray(lead.salespeople) ? lead.salespeople[0] : lead.salespeople;
        violations.push({
          id: lead.id,
          client_name: lead.client_name,
          product_name: lead.product_name,
          amount: Number(lead.amount),
          hours_since_contact: hoursSinceContact,
          salesperson_name: salesperson?.name || "Não atribuído",
          salesperson_email: salesperson?.email || null,
        });
      }
    }

    console.info(`Found ${violations.length} SLA violations`);

    // Send email if there are violations and we have email config
    if (violations.length > 0 && resendApiKey && notifyEmail) {
      const resend = new Resend(resendApiKey);

      const totalValue = violations.reduce((sum, v) => sum + v.amount, 0);
      const formattedValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalValue);

      const leadsHtml = violations
        .map(
          (v) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${v.client_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${v.product_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${v.hours_since_contact}h</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${v.salesperson_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${v.amount.toLocaleString("pt-BR")}</td>
          </tr>
        `
        )
        .join("");

      const subject = `⚠️ ${violations.length} leads aguardando contato há +${criticalHours}h`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⚠️ Alerta de SLA - Leads sem Contato</h2>
          <p style="color: #666;">
            Existem <strong>${violations.length} leads</strong> aguardando contato há mais de ${criticalHours} horas.
          </p>
          <p style="color: #666;">
            Valor total em risco: <strong style="color: #dc2626;">${formattedValue}</strong>
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Cliente</th>
                <th style="padding: 10px; text-align: left;">Produto</th>
                <th style="padding: 10px; text-align: left;">Horas</th>
                <th style="padding: 10px; text-align: left;">Vendedor</th>
                <th style="padding: 10px; text-align: left;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${leadsHtml}
            </tbody>
          </table>
          
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Este é um alerta automático do sistema de SLA. Acesse o dashboard para mais detalhes.
          </p>
        </div>
      `;

      let emailStatus = 'sent';
      let errorMessage: string | null = null;

      try {
        const emailResponse = await resend.emails.send({
          from: "SLA Alerts <onboarding@resend.dev>",
          to: [notifyEmail],
          subject,
          html: emailHtml,
        });

        console.info("Email sent:", emailResponse);
      } catch (emailError: any) {
        emailStatus = 'failed';
        errorMessage = emailError?.message || 'Unknown email error';
        console.error("Error sending email:", emailError);
      }

      // Log email to email_logs table
      await supabase.from('email_logs').insert({
        function_name: 'check-lead-sla',
        recipient_email: notifyEmail,
        subject,
        status: emailStatus,
        error_message: errorMessage,
        metadata: {
          violations_count: violations.length,
          total_value: totalValue,
          critical_hours: criticalHours,
          violations: violations.map(v => ({
            client_name: v.client_name,
            hours_since_contact: v.hours_since_contact,
            salesperson_name: v.salesperson_name,
          })),
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        violations: violations.length,
        leads: violations,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in SLA check:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
