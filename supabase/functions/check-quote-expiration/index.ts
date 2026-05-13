import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  console.info(`Checking for quotes expiring between ${now.toISOString()} and ${threeDaysFromNow.toISOString()}`);

  // 1. Get quotes expiring within 3 days that are still in 'sent' status
  const { data: expiringQuotes, error: fetchError } = await supabase
    .from('quotes')
    .select('*, salespeople:created_by(id, name)')
    .eq('status', 'sent')
    .lte('valid_until', threeDaysFromNow.toISOString().split('T')[0])
    .gte('valid_until', now.toISOString().split('T')[0]);

  if (fetchError) {
    console.error("Error fetching expiring quotes:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  console.info(`Found ${expiringQuotes?.length || 0} quotes expiring soon`);

  // 2. Create notifications for each expiring quote
  const notifications = expiringQuotes?.map(quote => ({
    user_id: quote.created_by,
    title: "Orçamento Expirando",
    message: `O orçamento ${quote.quote_number || quote.title} para ${quote.client_name} expira em breve (${quote.valid_until}).`,
    type: "warning",
    link: `/orcamentos`,
    metadata: { quote_id: quote.id }
  })) || [];

  if (notifications.length > 0) {
    const { error: notifyError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifyError) {
      console.error("Error creating notifications:", notifyError);
    } else {
      console.info(`Created ${notifications.length} notifications`);
    }
  }

  // 3. Auto-expire quotes that are past their valid_until date
  const { error: expireError } = await supabase
    .from('quotes')
    .update({ status: 'expired' })
    .eq('status', 'sent')
    .lt('valid_until', now.toISOString().split('T')[0]);

  if (expireError) {
    console.error("Error auto-expiring quotes:", expireError);
  }

  return new Response(JSON.stringify({ success: true, processed: expiringQuotes?.length || 0 }), { status: 200 });
});
