import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { withRequestId } from '../_shared/request-id.ts';
import { partitionNotificationBatch } from '../_shared/notification-categories.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(withRequestId('check-quote-expiration', async (_req, ctx) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  ctx.log('info', 'scan_started', {
    range_start: now.toISOString(),
    range_end: threeDaysFromNow.toISOString(),
  });

  // 1. Get quotes expiring within 3 days that are still in 'sent' status
  const { data: expiringQuotes, error: fetchError } = await supabase
    .from('quotes')
    .select('*, salespeople:created_by(id, name)')
    .eq('status', 'sent')
    .lte('valid_until', threeDaysFromNow.toISOString().split('T')[0])
    .gte('valid_until', now.toISOString().split('T')[0])
    .limit(1000);

  if (fetchError) {
    ctx.log('error', 'fetch_failed', { error: fetchError.message });
    return new Response(JSON.stringify({ error: fetchError.message, request_id: ctx.requestId }), { status: 500 });
  }

  ctx.log('info', 'expiring_quotes_found', { count: expiringQuotes?.length ?? 0 });

  // 2. Create notifications for each expiring quote — guarded pela partition
  // helper: categoria/prioridade/UUID inválidos são logados e pulados sem
  // derrubar o batch inteiro.
  const rawNotifications =
    expiringQuotes?.map(quote => ({
      user_id: quote.created_by,
      type: 'quote_expiring',
      category: 'sales' as const,
      priority: 'medium' as const,
      title: 'Orçamento Expirando',
      message: `O orçamento ${quote.quote_number || quote.title} para ${quote.client_name} expira em breve (${quote.valid_until}).`,
      action_url: '/orcamentos',
      action_label: 'Ver orçamentos',
      metadata: { quote_id: quote.id },
    })) || [];

  if (rawNotifications.length > 0) {
    const { valid, invalid } = partitionNotificationBatch(rawNotifications);
    if (invalid.length > 0) {
      ctx.log('warn', 'notifications_invalid', { count: invalid.length, samples: invalid.slice(0, 3).map(i => i.reason) });
    }
    if (valid.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(valid);

      if (notifyError) {
        ctx.log('error', 'notify_failed', { error: notifyError.message });
      } else {
        ctx.log('info', 'notifications_created', { count: valid.length, skipped: invalid.length });
      }
    }
  }

  // 3. Auto-expire quotes that are past their valid_until date
  const { error: expireError } = await supabase
    .from('quotes')
    .update({ status: 'expired' })
    .eq('status', 'sent')
    .lt('valid_until', now.toISOString().split('T')[0]);

  if (expireError) {
    ctx.log('error', 'auto_expire_failed', { error: expireError.message });
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: expiringQuotes?.length || 0,
      request_id: ctx.requestId,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}));
