import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get stagnant threshold from notification preferences (default 14 days)
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('stagnant_threshold_days')
      .limit(1)
      .maybeSingle();
    
    const stagnantDays = prefs?.stagnant_threshold_days || 14;
    const stagnantDate = new Date();
    stagnantDate.setDate(stagnantDate.getDate() - stagnantDays);
    
    console.log(`Checking for deals stagnant for more than ${stagnantDays} days (since ${stagnantDate.toISOString()})`);
    
    // Get all deals that haven't been updated in X days and are not completed
    const { data: stagnantDeals, error: dealsError } = await supabase
      .from('sales')
      .select('id, client_name, product_name, amount, status, salesperson_id, updated_at')
      .lt('updated_at', stagnantDate.toISOString())
      .neq('status', 'completed')
      .order('updated_at', { ascending: true });
    
    if (dealsError) {
      console.error('Error fetching stagnant deals:', dealsError);
      throw dealsError;
    }
    
    console.log(`Found ${stagnantDeals?.length || 0} stagnant deals`);
    
    if (!stagnantDeals || stagnantDeals.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No stagnant deals found',
          tasksCreated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for existing tasks for these deals to avoid duplicates
    const dealIds = stagnantDeals.map(d => d.id);
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('sale_id')
      .in('sale_id', dealIds)
      .gte('due_date', today)
      .neq('status', 'completed')
      .neq('status', 'cancelled');
    
    const existingDealIds = new Set(existingTasks?.map(t => t.sale_id) || []);
    
    // Filter out deals that already have pending tasks
    const dealsNeedingTasks = stagnantDeals.filter(d => !existingDealIds.has(d.id));
    
    console.log(`Creating tasks for ${dealsNeedingTasks.length} deals (${existingDealIds.size} already have tasks)`);
    
    // Create follow-up tasks for stagnant deals
    const tasksToCreate = dealsNeedingTasks.map(deal => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        title: `Follow-up: ${deal.client_name}`,
        description: `Deal estagnado há ${daysSinceUpdate} dias. Produto: ${deal.product_name}. Valor: R$ ${Number(deal.amount).toLocaleString('pt-BR')}. Status atual: ${deal.status}`,
        salesperson_id: deal.salesperson_id,
        sale_id: deal.id,
        priority: daysSinceUpdate > stagnantDays * 2 ? 'high' : 'medium',
        status: 'pending',
        task_type: 'follow_up',
        due_date: today,
      };
    });
    
    if (tasksToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToCreate);
      
      if (insertError) {
        console.error('Error creating tasks:', insertError);
        throw insertError;
      }
    }
    
    console.log(`Successfully created ${tasksToCreate.length} tasks`);
    
    return new Response(
      JSON.stringify({
        message: `Created ${tasksToCreate.length} follow-up tasks for stagnant deals`,
        tasksCreated: tasksToCreate.length,
        stagnantDealsFound: stagnantDeals.length,
        dealsAlreadyWithTasks: existingDealIds.size,
        thresholdDays: stagnantDays
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-stagnant-tasks function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
