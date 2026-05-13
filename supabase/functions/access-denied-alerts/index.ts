import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Default configuration (used if DB fetch fails)
const DEFAULT_SPIKE_THRESHOLD = 5;
const DEFAULT_TIME_WINDOW_HOURS = 1;
const DEFAULT_COOLDOWN_HOURS = 24;

interface AccessDeniedLog {
  id: string;
  user_id: string;
  user_email: string | null;
  attempted_path: string;
  user_role: string | null;
  required_role: string | null;
  created_at: string;
}

interface SpikeInfo {
  userEmail: string;
  userId: string;
  attemptCount: number;
  paths: string[];
  latestAttempt: string;
}

interface AlertSettings {
  spike_threshold: number;
  time_window_hours: number;
  cooldown_hours: number;
}

const buildSpikeAlertHtml = (spikes: SpikeInfo[], totalAttempts: number, settings: AlertSettings) => {
  const spikesHtml = spikes
    .map(
      (spike) => `
      <div style="background: #1a1a2e; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 12px; border-radius: 8px;">
        <h3 style="color: #f97316; margin: 0 0 8px 0;">🚨 ${spike.attemptCount} tentativas - ${spike.userEmail || "Email não disponível"}</h3>
        <p style="color: #e2e8f0; margin: 0;">User ID: <code style="background: #0f0f23; padding: 2px 6px; border-radius: 4px;">${spike.userId}</code></p>
        <p style="color: #94a3b8; margin: 8px 0 0 0;">Páginas tentadas: ${spike.paths.join(", ")}</p>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px;">Última tentativa: ${new Date(spike.latestAttempt).toLocaleString("pt-BR")}</p>
      </div>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Alerta de Segurança - Pico de Acessos Negados</title>
      </head>
      <body style="background: #0f0f23; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ Alerta de Segurança</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Detectado pico de tentativas de acesso negado</p>
          </div>
          <div style="background: #16162a; padding: 24px; border-radius: 0 0 12px 12px;">
            <div style="background: #0f0f23; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                <strong style="color: #f97316;">${totalAttempts}</strong> tentativas de acesso negado nas últimas ${settings.time_window_hours}h
              </p>
              <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">
                Limite configurado: ${settings.spike_threshold} tentativas por usuário em ${settings.time_window_hours}h
              </p>
            </div>
            
            <h2 style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0;">Usuários com atividade suspeita:</h2>
            ${spikesHtml}
            
            <div style="background: #0f0f23; padding: 16px; border-radius: 8px; margin-top: 16px;">
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                <strong>Recomendações:</strong>
              </p>
              <ul style="color: #64748b; margin: 8px 0 0 0; padding-left: 20px; font-size: 12px;">
                <li>Verifique se os usuários têm as permissões corretas</li>
                <li>Confirme se não há tentativas de escalação de privilégios</li>
                <li>Considere bloquear usuários suspeitos se necessário</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">
              Enviado automaticamente pelo Sistema de Vendas • ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

async function getAlertSettings(supabase: any): Promise<AlertSettings> {
  try {
    const { data, error } = await supabase
      .from("security_alert_settings")
      .select("spike_threshold, time_window_hours, cooldown_hours")
      .limit(1)
      .single();

    if (error || !data) {
      console.info("Using default settings (DB fetch failed):", error?.message);
      return {
        spike_threshold: DEFAULT_SPIKE_THRESHOLD,
        time_window_hours: DEFAULT_TIME_WINDOW_HOURS,
        cooldown_hours: DEFAULT_COOLDOWN_HOURS,
      };
    }

    console.info("Loaded settings from DB:", data);
    return {
      spike_threshold: data.spike_threshold,
      time_window_hours: data.time_window_hours,
      cooldown_hours: data.cooldown_hours,
    };
  } catch (e) {
    console.error("Error fetching settings:", e);
    return {
      spike_threshold: DEFAULT_SPIKE_THRESHOLD,
      time_window_hours: DEFAULT_TIME_WINDOW_HOURS,
      cooldown_hours: DEFAULT_COOLDOWN_HOURS,
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info("Starting access denied spike check...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get alert settings from database
    const settings = await getAlertSettings(supabase);
    console.info("Using settings:", settings);

    // Calculate time window
    const timeWindowStart = new Date();
    timeWindowStart.setHours(timeWindowStart.getHours() - settings.time_window_hours);

    // Fetch access denied logs from the time window
    const { data: logs, error: logsError } = await supabase
      .from("access_denied_logs")
      .select("*")
      .gte("created_at", timeWindowStart.toISOString())
      .order("created_at", { ascending: false });

    if (logsError) {
      throw new Error(`Failed to fetch access denied logs: ${logsError.message}`);
    }

    if (!logs || logs.length === 0) {
      console.info("No access denied attempts in the time window");
      return new Response(
        JSON.stringify({ message: "No access denied attempts found", spikesDetected: [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.info(`Found ${logs.length} access denied attempts in the last ${settings.time_window_hours} hour(s)`);

    // Group attempts by user
    const attemptsByUser: Record<string, AccessDeniedLog[]> = {};
    logs.forEach((log: AccessDeniedLog) => {
      if (!attemptsByUser[log.user_id]) {
        attemptsByUser[log.user_id] = [];
      }
      attemptsByUser[log.user_id].push(log);
    });

    // Detect spikes (users with attempts >= threshold)
    const spikes: SpikeInfo[] = [];
    for (const [userId, userLogs] of Object.entries(attemptsByUser)) {
      if (userLogs.length >= settings.spike_threshold) {
        const paths = [...new Set(userLogs.map(l => l.attempted_path))];
        spikes.push({
          userId,
          userEmail: userLogs[0].user_email || "N/A",
          attemptCount: userLogs.length,
          paths,
          latestAttempt: userLogs[0].created_at,
        });
      }
    }

    if (spikes.length === 0) {
      console.info("No spikes detected (no user exceeded threshold)");
      return new Response(
        JSON.stringify({ 
          message: "No spikes detected", 
          totalAttempts: logs.length,
          spikesDetected: [],
          settings 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.info(`Detected ${spikes.length} spike(s):`, spikes);

    // Get admin emails to notify
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      throw new Error(`Failed to fetch admin roles: ${rolesError.message}`);
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.info("No admin users found to notify");
      return new Response(
        JSON.stringify({ 
          message: "Spikes detected but no admins to notify", 
          spikesDetected: spikes.length 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin emails from salespeople table (linked by auth_user_id)
    const adminUserIds = adminRoles.map(r => r.user_id);
    const { data: adminSalespeople } = await supabase
      .from("salespeople")
      .select("email")
      .in("auth_user_id", adminUserIds)
      .not("email", "is", null);

    const adminEmails = adminSalespeople?.map(s => s.email).filter(Boolean) || [];

    // Also check notification_preferences for admin emails
    const { data: notifPrefs } = await supabase
      .from("notification_preferences")
      .select("email")
      .eq("is_active", true);

    const notifEmails = notifPrefs?.map(p => p.email).filter(Boolean) || [];
    
    // Combine and dedupe emails
    const allEmails = [...new Set([...adminEmails, ...notifEmails])];

    if (allEmails.length === 0) {
      console.info("No email addresses found for admins");
      return new Response(
        JSON.stringify({ 
          message: "Spikes detected but no admin emails configured", 
          spikesDetected: spikes.length 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.info(`Sending spike alert to ${allEmails.length} admin(s):`, allEmails);

    // Send alert email
    const subject = `🛡️ ALERTA: ${spikes.length} usuário(s) com pico de acessos negados`;
    const emailHtml = buildSpikeAlertHtml(spikes, logs.length, settings);

    let emailStatus = 'sent';
    let errorMessage: string | null = null;

    try {
      const emailResponse = await resend.emails.send({
        from: "Segurança <onboarding@resend.dev>",
        to: allEmails,
        subject,
        html: emailHtml,
      });
      console.info("Spike alert email sent:", emailResponse);
    } catch (emailError: any) {
      emailStatus = 'failed';
      errorMessage = emailError?.message || 'Unknown email error';
      console.error("Error sending email:", emailError);
    }

    // Log email to email_logs table for each recipient
    for (const email of allEmails) {
      await supabase.from('email_logs').insert({
        function_name: 'access-denied-alerts',
        recipient_email: email,
        subject,
        status: emailStatus,
        error_message: errorMessage,
        metadata: {
          spikes_count: spikes.length,
          total_attempts: logs.length,
          settings,
          spikes: spikes.map(s => ({
            user_email: s.userEmail,
            attempt_count: s.attemptCount,
          })),
        },
      });
    }

    // Log alert to history
    const { error: historyError } = await supabase
      .from("security_alert_history")
      .insert({
        alert_type: "access_denied_spike",
        recipients: allEmails,
        access_count: logs.length,
        time_window_hours: settings.time_window_hours,
        threshold_used: settings.spike_threshold,
      });

    if (historyError) {
      console.error("Failed to log alert history:", historyError);
    } else {
      console.info("Alert logged to history");
    }

    return new Response(
      JSON.stringify({
        message: emailStatus === 'sent' ? "Spike alert sent successfully" : "Spike alert failed",
        totalAttempts: logs.length,
        spikesDetected: spikes,
        emailsSentTo: allEmails,
        emailStatus,
        settings,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in access-denied-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
