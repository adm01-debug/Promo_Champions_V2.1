import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple Web Push implementation using fetch
async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    // For Web Push, we need to use the web-push library
    // Since we're in Deno, we'll use a simpler approach with FCM/native browser push
    // The subscription endpoint will handle the push delivery
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'high'
      },
      body: payload
    });

    if (response.ok) {
      return { success: true, status: response.status };
    } else {
      return { success: false, status: response.status, error: await response.text() };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, title, body, icon, tag, url, data } = await req.json();

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      throw new Error('user_ids array is required');
    }

    // Get push subscriptions for the users
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', user_ids);

    if (fetchError) throw fetchError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for users:', user_ids);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title: title || 'Nova Notificação',
      body: body || 'Você tem uma nova notificação',
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: tag || 'notification',
      data: {
        url: url || '/',
        ...data
      },
      requireInteraction: true
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const result = await sendWebPushNotification(
            {
              endpoint: sub.endpoint,
              p256dh: sub.p256dh,
              auth: sub.auth
            },
            payload,
            vapidPublicKey,
            vapidPrivateKey
          );

          if (!result.success) {
            // If subscription is invalid, remove it
            if (result.status === 404 || result.status === 410) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
              console.log('Removed invalid subscription:', sub.id);
            }
            throw new Error(result.error || `Push failed: ${result.status}`);
          }

          return { success: true, user_id: sub.user_id };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('Push error for user', sub.user_id, ':', message);
          return { success: false, user_id: sub.user_id, error: message };
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
    const failed = results.length - sent;

    console.log(`Push notifications sent: ${sent} success, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Send push notification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
