import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { subscription, user_id, action } = body;

    // Input validation
    if (!action || !['subscribe', 'unsubscribe', 'get-vapid-key'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be subscribe, unsubscribe, or get-vapid-key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'subscribe') {
      if (!user_id || typeof user_id !== 'string') {
        return new Response(
          JSON.stringify({ error: 'user_id is required for subscribe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return new Response(
          JSON.stringify({ error: 'Valid subscription with endpoint and keys is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription saved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'unsubscribe') {
      if (!user_id || typeof user_id !== 'string') {
        return new Response(
          JSON.stringify({ error: 'user_id is required for unsubscribe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription removed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get-vapid-key') {
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      return new Response(
        JSON.stringify({ vapidPublicKey: vapidPublicKey || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
