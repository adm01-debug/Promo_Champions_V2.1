import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.49.1/dist/module/lib/cors.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subscription, user_id, action } = await req.json();

    if (action === 'subscribe') {
      // Save push subscription to database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Push subscription saved:', data);

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription saved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'unsubscribe') {
      // Remove push subscription
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
      // Return the public VAPID key
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      
      if (!vapidPublicKey) {
        // If VAPID key not configured, return null - will use browser notifications only
        return new Response(
          JSON.stringify({ vapidPublicKey: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ vapidPublicKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Push subscribe error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
