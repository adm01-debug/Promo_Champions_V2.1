import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from '../_shared/auth-client.ts';

Deno.serve(
  withRequestId('push-subscribe', async (req, ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify({ ...(data as object), request_id: ctx.requestId }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    try {
      // Bypass de RLS necessário: o upsert em push_subscriptions já é
      // restrito ao user_id do JWT validado abaixo.
      const supabase = getServiceClient(
        'gerencia push_subscriptions do proprio usuario autenticado',
      );

      const body = await req.json();
      const { subscription, user_id, action } = body;

      if (!action || !['subscribe', 'unsubscribe', 'get-vapid-key'].includes(action)) {
        return json({ error: 'Invalid action. Must be subscribe, unsubscribe, or get-vapid-key' }, 400);
      }

      // get-vapid-key is public — no auth required
      if (action === 'get-vapid-key') {
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        return json({ vapidPublicKey: vapidPublicKey || null });
      }

      // subscribe / unsubscribe: caller must be authenticated and can only
      // manage their own subscription (user_id in body must match JWT sub)
      let caller;
      try {
        caller = await getUserClient(req);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return json({ error: 'Unauthorized' }, 401);
        }
        throw error;
      }
      const callerUserId = caller.userId;

      if (!user_id || typeof user_id !== 'string') {
        return json({ error: 'user_id is required' }, 400);
      }
      if (user_id !== callerUserId) {
        return json({ error: 'Forbidden: cannot manage another user\'s subscription' }, 403);
      }

      if (action === 'subscribe') {
        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
          return json({ error: 'Valid subscription with endpoint and keys is required' }, 400);
        }

        const { error } = await supabase
          .from('push_subscriptions')
          .upsert(
            {
              user_id,
              endpoint: subscription.endpoint,
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
          .select()
          .single();

        if (error) throw error;
        return json({ success: true, message: 'Subscription saved' });
      }

      // unsubscribe
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user_id);
      if (error) throw error;
      return json({ success: true, message: 'Subscription removed' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      ctx.log('error', 'push_subscribe_failed', { error: message });
      return json({ error: message }, 500);
    }
  }),
);
