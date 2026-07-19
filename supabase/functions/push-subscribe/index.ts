import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';

Deno.serve(
  withRequestId('push-subscribe', async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify({ ...(data as object), request_id: ctx.requestId }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
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
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
      if (claimsErr || !claimsData?.claims) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const callerUserId = claimsData.claims.sub as string;

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
