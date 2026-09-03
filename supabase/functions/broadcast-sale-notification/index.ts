import { Resend } from 'npm:resend@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { getUserClient, getServiceClient, UnauthorizedError } from '../_shared/auth-client.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
const resend = new Resend(RESEND_API_KEY);

Deno.serve(withRequestId('broadcast-sale-notification', async (req, ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Authentication ────────────────────────────────────────────────────
  // Require a valid user JWT. Content (salesperson_name, client_name, amount)
  // is read from the DB — NOT the request body — to prevent content injection.
  let callerUserId: string;
  try {
    const ctx2 = await getUserClient(req);
    callerUserId = ctx2.userId;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + e.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw e;
  }

  try {
    const supabase = getServiceClient("broadcast-sale-notification reads sale/salespeople, writes audit log");

    const body = await req.json() as { sale_id?: string };
    const { sale_id } = body;

    if (!sale_id || typeof sale_id !== 'string') {
      throw new Error('Missing required field: sale_id');
    }

    // Read sale data from DB — never trust caller-supplied salesperson_name,
    // client_name, or amount (content injection / social engineering prevention).
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .select('id, salesperson_id, client_name, amount, salespeople(name, auth_user_id)')
      .eq('id', sale_id)
      .maybeSingle();

    if (saleErr || !sale) {
      return new Response(JSON.stringify({ error: 'Sale not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authorization: only the salesperson on the sale or an admin may trigger.
    if (sale.salesperson_id !== callerUserId) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', callerUserId)
        .maybeSingle();
      if (!roleRow || !['admin', 'manager'].includes(roleRow.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden: only the seller or an admin may broadcast this sale' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const salesperson_id: string = sale.salesperson_id ?? '';
    const salesperson_name: string = (sale.salespeople as { name?: string } | null)?.name ?? 'Vendedor';
    const client_name: string = sale.client_name ?? 'Cliente';
    const amount: number = Number(sale.amount ?? 0);

    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    // 1. Calculate Rankings for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: salesStats, error: statsError } = await supabase
      .from('sales')
      .select('salesperson_id, amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString())
      .limit(50000);

    if (statsError) throw statsError;

    // Group sales by salesperson
    const totals: Record<string, number> = {};
    salesStats?.forEach(s => {
      if (s.salesperson_id) {
        totals[s.salesperson_id] = (totals[s.salesperson_id] || 0) + Number(s.amount);
      }
    });

    // Create sorted ranking list + O(1) lookup Map
    const ranking = Object.entries(totals)
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const rankingMap = new Map<string, number>();
    for (const { id, rank } of ranking) rankingMap.set(id, rank);

    const sellerRank = rankingMap.get(salesperson_id) ?? 1;

    // 2. Fetch all active salespeople with their preferences
    const { data: recipients, error: recipientsError } = await supabase
      .from('salespeople')
      .select('id, auth_user_id, name, email, notify_sales_in_app, notify_sales_email')
      .eq('is_active', true)
      .neq('id', salesperson_id)
      .limit(500);

    if (recipientsError) throw recipientsError;

    const results = [];
    // Collect audit rows during the loop; batch-insert once at the end
    const auditRows: Record<string, unknown>[] = [];

    for (const recipient of recipients || []) {
      const recipientRank = rankingMap.get(recipient.id) ?? 0;

      const title = `🚀 ${salesperson_name} vendeu!`;
      const message =
        `Fechou ${formattedAmount} com ${client_name}! Rank dele: #${sellerRank}. ` +
        (recipientRank > 0
          ? `Seu rank: #${recipientRank}.`
          : 'Você ainda não pontuou este mês.');

      const baseAudit = {
        sale_id,
        seller_id: salesperson_id,
        seller_name: salesperson_name,
        sale_amount: amount,
        seller_rank_at_time: sellerRank,
        recipient_id: recipient.id,
        recipient_rank_at_time: recipientRank,
        message_sent: message,
      };

      // A. In-App Notification
      if (recipient.notify_sales_in_app && recipient.auth_user_id) {
        try {
          await supabase.rpc('send_notification', {
            p_user_id: recipient.auth_user_id,
            p_title: title,
            p_message: message,
            p_category: 'gamification',
            p_type: 'sale_alert',
            p_priority: 'high',
            p_metadata: {
              sale_id,
              seller_id: salesperson_id,
              seller_rank: sellerRank,
              recipient_rank: recipientRank,
              is_competition_alert: true,
              amount,
            },
          });
          auditRows.push({ ...baseAudit, notification_type: 'in-app', channel: 'in-app', status: 'success' });
        } catch (e) {
          console.error(`In-app failed for ${recipient.id}:`, e);
          auditRows.push({ ...baseAudit, notification_type: 'in-app', channel: 'in-app', status: 'failed', error_log: String(e) });
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
            from: 'Vendas Elite <vendas@resend.dev>',
            to: [recipient.email],
            subject: emailSubject,
            html: emailHtml,
          });

          auditRows.push({
            ...baseAudit,
            notification_type: 'email',
            channel: 'email',
            status: emailResponse.error ? 'failed' : 'success',
            error_log: emailResponse.error ? JSON.stringify(emailResponse.error) : null,
          });
        } catch (e) {
          console.error(`Email failed for ${recipient.id}:`, e);
          auditRows.push({ ...baseAudit, notification_type: 'email', channel: 'email', status: 'failed', error_log: String(e) });
        }
      }

      results.push({ id: recipient.id, name: recipient.name });
    }

    // Single batch insert for all audit rows (replaces N individual inserts)
    if (auditRows.length > 0) {
      const { error: auditErr } = await supabase.from('sale_notifications_audit').insert(auditRows);
      if (auditErr) console.error('[broadcast-sale-notification] Audit batch insert error:', auditErr);
    }

    ctx.log('info', 'broadcast_ok', { notified: results.length, sale_id });
    return new Response(JSON.stringify({ success: true, notified: results.length, request_id: ctx.requestId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.log('error', 'broadcast_failed', { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, request_id: ctx.requestId }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
