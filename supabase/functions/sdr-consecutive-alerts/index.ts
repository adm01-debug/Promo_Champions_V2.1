import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface UnderperformingSDR {
  id: string;
  name: string;
  email: string | null;
  consecutiveDays: number;
  avgDeficit: number;
  dailyGoal: number;
}

async function getUnderperformingSDRs(supabase: any, consecutiveThreshold: number = 3): Promise<UnderperformingSDR[]> {
  console.info("Fetching SDRs and their activity goals...");
  
  // Get SDRs (role = 'sdr' or 'hybrid')
  const { data: sdrs, error: sdrsError } = await supabase
    .from("salespeople")
    .select("id, name, email, role")
    .in("role", ["sdr", "hybrid"])
    .eq("is_active", true);

  if (sdrsError) {
    console.error("Error fetching SDRs:", sdrsError);
    throw sdrsError;
  }

  console.info(`Found ${sdrs?.length || 0} active SDRs`);

  // Get activity goals for SDRs
  const { data: goals, error: goalsError } = await supabase
    .from("activity_goals")
    .select("salesperson_id, calls_goal, emails_goal, meetings_goal, linkedin_goal, whatsapp_goal");

  if (goalsError) {
    console.error("Error fetching goals:", goalsError);
    throw goalsError;
  }

  const goalsMap: Record<string, number> = {};
  goals?.forEach((g: any) => {
    goalsMap[g.salesperson_id] = 
      (g.calls_goal || 0) + 
      (g.emails_goal || 0) + 
      (g.meetings_goal || 0) + 
      (g.linkedin_goal || 0) + 
      (g.whatsapp_goal || 0);
  });

  // Get activities from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("salesperson_id, created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  if (activitiesError) {
    console.error("Error fetching activities:", activitiesError);
    throw activitiesError;
  }

  console.info(`Found ${activities?.length || 0} activities in last 7 days`);

  // Group activities by SDR and date
  const activityBySDRAndDate: Record<string, Record<string, number>> = {};
  activities?.forEach((a: any) => {
    if (!a.salesperson_id) return;
    const date = a.created_at.split("T")[0];
    if (!activityBySDRAndDate[a.salesperson_id]) {
      activityBySDRAndDate[a.salesperson_id] = {};
    }
    activityBySDRAndDate[a.salesperson_id][date] = 
      (activityBySDRAndDate[a.salesperson_id][date] || 0) + 1;
  });

  // Calculate consecutive days below goal for each SDR
  const underperforming: UnderperformingSDR[] = [];
  const today = new Date();
  
  for (const sdr of sdrs || []) {
    const goal = goalsMap[sdr.id] || 0;
    if (goal <= 0) continue;

    const sdrActivities = activityBySDRAndDate[sdr.id] || {};
    let consecutiveCount = 0;
    let maxConsecutive = 0;
    let totalDeficit = 0;
    let deficitDays = 0;

    // Check last 7 days (most recent first)
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      const dayActivities = sdrActivities[dateStr] || 0;

      if (dayActivities < goal) {
        consecutiveCount++;
        totalDeficit += (goal - dayActivities);
        deficitDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 0;
      }
    }

    if (maxConsecutive >= consecutiveThreshold) {
      underperforming.push({
        id: sdr.id,
        name: sdr.name,
        email: sdr.email,
        consecutiveDays: maxConsecutive,
        avgDeficit: deficitDays > 0 ? Math.round(totalDeficit / deficitDays) : 0,
        dailyGoal: goal,
      });
    }
  }

  console.info(`Found ${underperforming.length} underperforming SDRs`);
  return underperforming;
}

function buildEmailHtml(sdrs: UnderperformingSDR[]): string {
  const sdrRows = sdrs.map(sdr => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sdr.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background-color: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-weight: 600;">
          ${sdr.consecutiveDays} dias
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${sdr.dailyGoal}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 600;">
        -${sdr.avgDeficit}/dia
      </td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta: SDRs Abaixo da Meta</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Alerta de Performance SDR</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">SDRs consistentemente abaixo da meta de atividades</p>
        </div>
        
        <div style="padding: 24px;">
          <p style="color: #374151; margin-bottom: 20px;">
            Os seguintes SDRs estão abaixo da meta de atividades por <strong>3 ou mais dias consecutivos</strong>:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">SDR</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Dias Consecutivos</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Meta Diária</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Déficit Médio</th>
              </tr>
            </thead>
            <tbody>
              ${sdrRows}
            </tbody>
          </table>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Recomendação:</strong> Entre em contato com esses SDRs para entender os obstáculos e oferecer suporte.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 16px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Este é um alerta automático do sistema de gestão de vendas.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendNotificationToSDR(sdr: UnderperformingSDR, supabase: any): Promise<void> {
  if (!sdr.email) {
    console.info(`SDR ${sdr.name} has no email configured, skipping personal notification`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta de Meta de Atividades</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📊 Alerta de Atividades</h1>
        </div>
        
        <div style="padding: 24px;">
          <p style="color: #374151; margin-bottom: 16px;">Olá <strong>${sdr.name}</strong>,</p>
          
          <p style="color: #374151; margin-bottom: 20px;">
            Notamos que você está abaixo da sua meta de atividades por 
            <strong style="color: #dc2626;">${sdr.consecutiveDays} dias consecutivos</strong>.
          </p>
          
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Meta diária:</span>
              <strong style="color: #374151;">${sdr.dailyGoal} atividades</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Déficit médio:</span>
              <strong style="color: #dc2626;">-${sdr.avgDeficit} atividades/dia</strong>
            </div>
          </div>
          
          <p style="color: #374151; margin-bottom: 0;">
            💪 Você consegue! Se precisar de ajuda ou tiver algum obstáculo, converse com seu gestor.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 16px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Este é um alerta automático do sistema.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `⚠️ Alerta: Você está ${sdr.consecutiveDays} dias abaixo da meta`;

  try {
    await resend.emails.send({
      from: "CRM <onboarding@resend.dev>",
      to: [sdr.email],
      subject,
      html,
    });
    console.info(`Personal notification sent to ${sdr.name} (${sdr.email})`);
    
    // Log successful email
    await supabase.from("email_logs").insert({
      function_name: "sdr-consecutive-alerts",
      recipient_email: sdr.email,
      subject,
      status: "sent",
      metadata: { sdr_name: sdr.name, consecutive_days: sdr.consecutiveDays }
    });
  } catch (error: any) {
    console.error(`Error sending email to ${sdr.email}:`, error);
    
    // Log failed email
    await supabase.from("email_logs").insert({
      function_name: "sdr-consecutive-alerts",
      recipient_email: sdr.email,
      subject,
      status: "failed",
      error_message: error.message,
      metadata: { sdr_name: sdr.name, consecutive_days: sdr.consecutiveDays }
    });
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info("Starting SDR consecutive alerts check...");

    // Check if this is a manual trigger
    let triggeredBy = "cron";
    try {
      const body = await req.json();
      if (body?.triggered_by === "manual") {
        triggeredBy = "manual";
      }
    } catch {
      // No body or invalid JSON, default to cron
    }

    console.info(`Triggered by: ${triggeredBy}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the minimum consecutive threshold from notification preferences
    const { data: notifPrefs } = await supabase
      .from("notification_preferences")
      .select("consecutive_days_threshold")
      .eq("is_active", true)
      .order("consecutive_days_threshold", { ascending: true })
      .limit(1);

    const consecutiveThreshold = notifPrefs?.[0]?.consecutive_days_threshold || 3;
    console.info(`Using consecutive threshold: ${consecutiveThreshold} days`);

    const underperformingSDRs = await getUnderperformingSDRs(supabase, consecutiveThreshold);

    if (underperformingSDRs.length === 0) {
      console.info("No underperforming SDRs found, no alerts needed");

      // Still log the check for manual triggers
      if (triggeredBy === "manual") {
        await supabase.from("sdr_alert_history").insert({
          triggered_by: triggeredBy,
          sdrs_notified: 0,
          threshold_used: consecutiveThreshold,
          sdr_details: [],
          admin_emails: [],
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "No alerts needed", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin/manager emails for summary notification
    const { data: adminUsers, error: adminError } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "manager"]);

    if (adminError) {
      console.error("Error fetching admin users:", adminError);
    }

    const adminEmails: string[] = [];
    if (adminUsers?.length) {
      for (const admin of adminUsers) {
        const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);
        if (authUser?.user?.email) {
          adminEmails.push(authUser.user.email);
        }
      }
    }

    console.info(`Found ${adminEmails.length} admin/manager emails for summary`);

    // Send summary to admins/managers
    if (adminEmails.length > 0) {
      const summaryHtml = buildEmailHtml(underperformingSDRs);
      const summarySubject = `⚠️ Alerta: ${underperformingSDRs.length} SDRs abaixo da meta por dias consecutivos`;
      
      try {
        await resend.emails.send({
          from: "CRM <onboarding@resend.dev>",
          to: adminEmails,
          subject: summarySubject,
          html: summaryHtml,
        });
        console.info("Summary email sent to admins/managers");
        
        // Log successful emails for each admin
        for (const email of adminEmails) {
          await supabase.from("email_logs").insert({
            function_name: "sdr-consecutive-alerts",
            recipient_email: email,
            subject: summarySubject,
            status: "sent",
            metadata: { type: "admin_summary", sdrs_count: underperformingSDRs.length }
          });
        }
      } catch (error: any) {
        console.error("Error sending summary email:", error);
        for (const email of adminEmails) {
          await supabase.from("email_logs").insert({
            function_name: "sdr-consecutive-alerts",
            recipient_email: email,
            subject: summarySubject,
            status: "failed",
            error_message: error.message,
            metadata: { type: "admin_summary", sdrs_count: underperformingSDRs.length }
          });
        }
      }
    }

    // Send individual notifications to each underperforming SDR
    for (const sdr of underperformingSDRs) {
      await sendNotificationToSDR(sdr, supabase);
    }

    // Log the alert to history
    await supabase.from("sdr_alert_history").insert({
      triggered_by: triggeredBy,
      sdrs_notified: underperformingSDRs.length,
      threshold_used: consecutiveThreshold,
      sdr_details: underperformingSDRs,
      admin_emails: adminEmails,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Alerts sent for ${underperformingSDRs.length} underperforming SDRs`,
        count: underperformingSDRs.length,
        sdrs: underperformingSDRs.map(s => s.name),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in SDR consecutive alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
