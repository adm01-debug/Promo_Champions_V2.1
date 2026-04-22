import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NewDeviceAlertRequest {
  user_id: string;
  user_email: string;
  device_fingerprint: string;
  browser: string;
  os: string;
  ip_address: string;
  location?: string;
}

const generateEmailHTML = (data: NewDeviceAlertRequest) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .device-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .device-info table { width: 100%; border-collapse: collapse; }
    .device-info td { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .device-info td:first-child { color: #6b7280; width: 40%; }
    .device-info td:last-child { font-weight: 500; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px 10px 0; }
    .button.danger { background: #ef4444; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Novo Dispositivo Detectado</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <strong>Alerta de Segurança</strong>
        <p style="margin: 10px 0 0 0;">Um novo login foi detectado em sua conta a partir de um dispositivo ou localização desconhecida.</p>
      </div>
      
      <h3>Detalhes do Acesso:</h3>
      <div class="device-info">
        <table>
          <tr>
            <td>📱 Navegador</td>
            <td>${data.browser}</td>
          </tr>
          <tr>
            <td>💻 Sistema</td>
            <td>${data.os}</td>
          </tr>
          <tr>
            <td>🌐 Endereço IP</td>
            <td>${data.ip_address}</td>
          </tr>
          <tr>
            <td>📍 Localização</td>
            <td>${data.location || 'Não disponível'}</td>
          </tr>
          <tr>
            <td>🕐 Data/Hora</td>
            <td>${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>Foi você?</strong></p>
      <p>Se você reconhece este acesso, pode ignorar este email. O dispositivo será adicionado à sua lista de dispositivos confiáveis.</p>
      <p>Se <strong>NÃO foi você</strong>, recomendamos:</p>
      <ul>
        <li>Alterar sua senha imediatamente</li>
        <li>Encerrar todas as sessões ativas</li>
        <li>Ativar autenticação de dois fatores (2FA)</li>
      </ul>
    </div>
    <div class="footer">
      <p>Este é um email automático de segurança do PROMO CHAMPIONS.</p>
      <p>Se você não reconhece esta atividade, entre em contato conosco imediatamente.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("New device alert function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: NewDeviceAlertRequest = await req.json();

    // Input validation
    if (!data.user_id || typeof data.user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data.user_email || !data.user_email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid user_email is required' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data.device_fingerprint) {
      return new Response(JSON.stringify({ error: 'device_fingerprint is required' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if device is already known
    const { data: existingDevice } = await supabase
      .from("known_devices")
      .select("id")
      .eq("user_id", data.user_id)
      .eq("device_fingerprint", data.device_fingerprint)
      .maybeSingle();

    if (existingDevice) {
      // Update last seen
      await supabase
        .from("known_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existingDevice.id);

      console.log("Known device, updating last_seen");
      return new Response(
        JSON.stringify({ message: "Known device", is_new: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // New device detected - register it
    const { error: insertDeviceError } = await supabase
      .from("known_devices")
      .insert({
        user_id: data.user_id,
        device_fingerprint: data.device_fingerprint,
        device_name: `${data.browser} em ${data.os}`,
        browser: data.browser,
        os: data.os,
        ip_address: data.ip_address,
        location: data.location,
        is_trusted: false,
      });

    if (insertDeviceError) {
      console.error("Error inserting device:", insertDeviceError);
    }

    // Create login alert
    const { data: alert, error: alertError } = await supabase
      .from("login_alerts")
      .insert({
        user_id: data.user_id,
        device_fingerprint: data.device_fingerprint,
        ip_address: data.ip_address,
        browser: data.browser,
        os: data.os,
        location: data.location,
        alert_type: "new_device",
        email_sent: false,
      })
      .select()
      .single();

    if (alertError) {
      console.error("Error creating alert:", alertError);
    }

    // Send email notification
    console.log("Sending new device alert email to:", data.user_email);
    
    const emailResponse = await resend.emails.send({
      from: "PROMO CHAMPIONS Security <onboarding@resend.dev>",
      to: [data.user_email],
      subject: "⚠️ Novo dispositivo detectado em sua conta",
      html: generateEmailHTML(data),
    });

    console.log("Email sent:", emailResponse);

    // Update alert as sent
    if (alert) {
      await supabase
        .from("login_alerts")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", alert.id);
    }

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: data.user_email,
      subject: "Novo dispositivo detectado",
      function_name: "new-device-alert",
      status: "sent",
      metadata: { device: data.browser, os: data.os, ip: data.ip_address },
    });

    // Send push notification to user
    try {
      console.log("Sending push notification for new device...");
      
      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", data.user_id);
      
      if (subscriptions && subscriptions.length > 0) {
        // Invoke push notification function
        const pushPayload = {
          userId: data.user_id,
          title: "🔒 Novo Dispositivo Detectado",
          body: `Login de ${data.browser} em ${data.os} (IP: ${data.ip_address})`,
          tag: "new-device-alert",
          data: {
            type: "new_device",
            url: "/dashboard/seguranca",
            device: data.device_fingerprint,
          },
          requireInteraction: true,
        };
        
        // Call the send-push-notification function
        const pushResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-push-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify(pushPayload),
          }
        );
        
        const pushResult = await pushResponse.json();
        console.log("Push notification result:", pushResult);
      } else {
        console.log("No push subscriptions found for user");
      }
    } catch (pushError) {
      console.error("Error sending push notification:", pushError);
      // Don't fail the request if push fails
    }

    return new Response(
      JSON.stringify({ 
        message: "New device alert sent", 
        is_new: true,
        alert_id: alert?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in new-device-alert function:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
