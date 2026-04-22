import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

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
      return new Response(
        JSON.stringify({ error: "sale_id, salesperson_id e amount são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);

    // Buscar vendedores ativos com user_id (exceto o vendedor da venda)
    const { data: recipients, error: recipientsError } = await supabase
      .from("salespeople")
      .select("id, user_id, name")
      .eq("is_active", true)
      .neq("id", salesperson_id)
      .not("user_id", "is", null);

    if (recipientsError) throw recipientsError;

    const userIds: string[] = (recipients ?? [])
      .map((r: { user_id: string | null }) => r.user_id)
      .filter((id): id is string => !!id);

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notified: 0, pushed: 0, message: "No recipients" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const title = `🔥 ${salesperson_name} fechou uma venda!`;
    const message = `${client_name} — ${formattedAmount}`;
    const metadata = { sale_id, amount, seller_id: salesperson_id };

    // 1. Notificações in-app via RPC send_notification (uma por destinatário)
    const notifyResults = await Promise.allSettled(
      userIds.map((uid) =>
        supabase.rpc("send_notification", {
          p_user_id: uid,
          p_title: title,
          p_message: message,
          p_category: "sales",
          p_priority: "medium",
          p_action_url: "/vendas",
          p_metadata: metadata,
        }),
      ),
    );
    const notified = notifyResults.filter((r) => r.status === "fulfilled").length;

    // 2. Web push em chunks de 100
    let pushed = 0;
    const chunkSize = 100;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      try {
        const { data: pushData, error: pushError } = await supabase.functions.invoke(
          "send-push-notification",
          {
            body: {
              user_ids: chunk,
              title,
              body: message,
              tag: `sale-${sale_id}`,
              url: "/vendas",
              data: metadata,
            },
          },
        );
        if (!pushError && pushData?.sent) pushed += pushData.sent;
      } catch (e) {
        console.error("push chunk failed", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified, pushed, total: userIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("broadcast-sale-notification error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
