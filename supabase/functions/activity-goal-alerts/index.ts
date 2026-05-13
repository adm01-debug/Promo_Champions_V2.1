import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SalespersonAlert {
  name: string;
  email: string | null;
  progress: number;
  current: { calls: number; emails: number; meetings: number };
  goals: { calls: number; emails: number; meetings: number };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info('Starting activity goal check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date range
    const today = new Date();
    const dayStart = new Date(today);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(today);
    dayEnd.setHours(23, 59, 59, 999);

    console.info(`Checking activities for ${today.toISOString().split('T')[0]}`);

    // Fetch active salespeople with emails
    const { data: salespeople, error: spError } = await supabase
      .from('salespeople')
      .select('id, name, email')
      .eq('is_active', true);

    if (spError) {
      console.error('Error fetching salespeople:', spError);
      throw spError;
    }

    // Fetch activity goals
    const { data: goals, error: goalsError } = await supabase
      .from('activity_goals')
      .select('*');

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      throw goalsError;
    }

    // Fetch today's activities
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('salesperson_id, activity_type')
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());

    if (actError) {
      console.error('Error fetching activities:', actError);
      throw actError;
    }

    // Calculate progress and identify those below 50%
    const alertList: SalespersonAlert[] = [];

    for (const sp of salespeople || []) {
      const spGoals = (goals || []).find(g => g.salesperson_id === sp.id);
      
      // Skip if no goals configured
      if (!spGoals) {
        console.info(`${sp.name}: No goals configured, skipping`);
        continue;
      }

      const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);

      const currentCalls = spActivities.filter(a => a.activity_type === 'call').length;
      const currentEmails = spActivities.filter(a => a.activity_type === 'email').length;
      const currentMeetings = spActivities.filter(a => a.activity_type === 'meeting').length;

      const goalCalls = spGoals.calls_goal || 0;
      const goalEmails = spGoals.emails_goal || 0;
      const goalMeetings = spGoals.meetings_goal || 0;

      const calcProgress = (current: number, goal: number) => 
        goal > 0 ? (current / goal) * 100 : 100;

      const progressCalls = calcProgress(currentCalls, goalCalls);
      const progressEmails = calcProgress(currentEmails, goalEmails);
      const progressMeetings = calcProgress(currentMeetings, goalMeetings);

      const totalGoals = [goalCalls, goalEmails, goalMeetings].filter(g => g > 0).length;
      const overallProgress = totalGoals > 0
        ? (progressCalls + progressEmails + progressMeetings) / totalGoals
        : 100;

      console.info(`${sp.name}: ${overallProgress.toFixed(0)}% progress`);

      // Alert if below 50%
      if (overallProgress < 50) {
        alertList.push({
          name: sp.name,
          email: sp.email,
          progress: overallProgress,
          current: { calls: currentCalls, emails: currentEmails, meetings: currentMeetings },
          goals: { calls: goalCalls, emails: goalEmails, meetings: goalMeetings },
        });
      }
    }

    console.info(`Found ${alertList.length} salespeople below 50% progress`);

    // Send email alerts if there are any and Resend is configured
    if (alertList.length > 0 && resendApiKey) {
      // Get notification preferences email
      const { data: notifPrefs } = await supabase
        .from('notification_preferences')
        .select('email')
        .eq('is_active', true)
        .limit(1);

      const adminEmail = notifPrefs?.[0]?.email;

      if (adminEmail) {
        const subject = `⚠️ Alerta: ${alertList.length} vendedor(es) abaixo da meta de atividades`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">⚠️ Alerta: Vendedores Abaixo da Meta</h2>
            <p>Os seguintes vendedores estão com menos de 50% da meta de atividades às 15h:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Vendedor</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Progresso</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Calls</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Emails</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Reuniões</th>
                </tr>
              </thead>
              <tbody>
                ${alertList.map(sp => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${sp.name}</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${sp.progress.toFixed(0)}%</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${sp.current.calls}/${sp.goals.calls}</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${sp.current.emails}/${sp.goals.emails}</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${sp.current.meetings}/${sp.goals.meetings}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Este alerta foi enviado automaticamente às 15h. Acesse o dashboard para mais detalhes.
            </p>
          </div>
        `;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'PROMO CHAMPIONS <onboarding@resend.dev>',
            to: [adminEmail],
            subject,
            html: emailHtml,
          }),
        });

        // Log email to email_logs table
        const emailStatus = emailRes.ok ? 'sent' : 'failed';
        const errorMessage = emailRes.ok ? null : await emailRes.text();

        await supabase.from('email_logs').insert({
          function_name: 'activity-goal-alerts',
          recipient_email: adminEmail,
          subject,
          status: emailStatus,
          error_message: errorMessage,
          metadata: {
            salespeople_count: alertList.length,
            salespeople: alertList.map(a => ({ name: a.name, progress: a.progress })),
          },
        });

        if (emailRes.ok) {
          console.info(`Email alert sent to ${adminEmail}`);
        } else {
          console.error('Error sending email:', errorMessage);
        }
      } else {
        console.info('No admin email configured in notification_preferences');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: salespeople?.length || 0,
        belowTarget: alertList.length,
        alerts: alertList.map(a => ({ name: a.name, progress: a.progress })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in activity-goal-alerts:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
