import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface Payload {
  sale_id: string;
  salesperson_id: string;
  salesperson_name: string;
  client_name: string;
  amount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = (await req.json()) as Payload;
    const { sale_id, salesperson_id, salesperson_name, client_name, amount } = body;

    if (!sale_id || !salesperson_id || typeof amount !== "number") {
      throw new Error("Missing required fields: sale_id, salesperson_id, amount");
    }

    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);

    // 1. Calculate Rankings for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: salesStats, error: statsError } = await supabase
      .from("sales")
      .select("salesperson_id, amount")
      .eq("status", "completed")
      .gte("created_at", startOfMonth.toISOString());

    if (statsError) throw statsError;

    // Group sales by salesperson
    const totals: Record<string, number> = {};
    salesStats?.forEach(s => {
      if (s.salesperson_id) {
        totals[s.salesperson_id] = (totals[s.salesperson_id] || 0) + Number(s.amount);
      }
    });

    // Create sorted ranking list
    const ranking = Object.entries(totals)
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const sellerRank = ranking.find(r => r.id === salesperson_id)?.rank || 1;

    // 2. Fetch all active salespeople with their preferences
    const { data: recipients, error: recipientsError } = await supabase
      .from("salespeople")
      .select("id, auth_user_id, name, email, notify_sales_in_app, notify_sales_email")
      .eq("is_active", true)
      .neq("id", salesperson_id);

    if (recipientsError) throw recipientsError;

    const results = [];

    for (const recipient of (recipients || [])) {
      const recipientRankInfo = ranking.find(r => r.id === recipient.id);
      const recipientRank = recipientRankInfo?.rank || 0;

      const title = `🚀 ${salesperson_name} vendeu!`;
      const message = `Fechou ${formattedAmount} com ${client_name}! Rank dele: #${sellerRank}. ` +
                      (recipientRank > 0 ? `Seu rank: #${recipientRank}.` : "Você ainda não pontuou este mês.");

      // A. In-App Notification
      if (recipient.notify_sales_in_app && recipient.auth_user_id) {
        try {
          await supabase.rpc("send_notification", {
            p_user_id: recipient.auth_user_id,
            p_title: title,
            p_message: message,
            p_category: "gamification",
            p_type: "sale_alert",
            p_priority: "high",
            p_metadata: {
              sale_id,
              seller_id: salesperson_id,
              seller_rank: sellerRank,
              recipient_rank: recipientRank,
              is_competition_alert: true,
              amount
            }
          });
          
          await supabase.from("sale_notifications_audit").insert({
            sale_id,
            seller_id: salesperson_id,
            seller_name: salesperson_name,
            sale_amount: amount,
            seller_rank_at_time: sellerRank,
            recipient_id: recipient.id,
            recipient_rank_at_time: recipientRank,
            notification_type: 'in-app',
            channel: 'in-app',
            message_sent: message,
            status: 'success'
          });
        } catch (e) {
          console.error(`In-app failed for ${recipient.id}:`, e);
        }
      }

      // B. Email Notification
      if (recipient.notify_sales_email && recipient.email) {
        try {
          const emailSubject = `🔥 Venda fechada! ${salesperson_name} acelerou!`;
          const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; background: #0f0f23; color: white; border-radius: 10px;">
              <h2 style="color: #f97316;">${title}</h2>
              <p style="font-size: 18px;">${message}</p>
              <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
              <p style="font-size: 14px; color: #888;">Vamos pra cima! A meta não para. 🚀</p>
            </div>
          `;

          const emailResponse = await resend.emails.send({
            from: "Vendas Elite <vendas@resend.dev>",
            to: [recipient.email],
            subject: emailSubject,
            html: emailHtml,
          });

          await supabase.from("sale_notifications_audit").insert({
            sale_id,
            seller_id: salesperson_id,
            seller_name: salesperson_name,
            sale_amount: amount,
            seller_rank_at_time: sellerRank,
            recipient_id: recipient.id,
            recipient_rank_at_time: recipientRank,
            notification_type: 'email',
            channel: 'email',
            message_sent: message,
            status: emailResponse.error ? 'failed' : 'success',
            error_log: emailResponse.error ? JSON.stringify(emailResponse.error) : null
          });
        } catch (e) {
          console.error(`Email failed for ${recipient.id}:`, e);
        }
      }

      results.push({ id: recipient.id, name: recipient.name });
    }

    return new Response(
      JSON.stringify({ success: true, notified: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error: any) {
    console.error("Broadcast error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
