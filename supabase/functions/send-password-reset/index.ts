import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface PasswordResetRequest {
  email: string;
  requestId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is an admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Only admins can approve password resets");
    }

    const { email, requestId }: PasswordResetRequest = await req.json();

    if (!email || !requestId) {
      throw new Error("Email and requestId are required");
    }

    console.log(`Processing password reset approval for: ${email}`);

    // Verify the request exists and is approved
    const { data: resetRequest, error: requestError } = await supabaseAdmin
      .from("password_reset_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "approved")
      .single();

    if (requestError || !resetRequest) {
      throw new Error("Invalid or non-approved reset request");
    }

    // Generate password reset link using Supabase Auth Admin API
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw new Error(`Failed to generate reset link: ${resetError.message}`);
    }

    const resetLink = resetData.properties?.action_link;
    console.log("Reset link generated successfully");

    // Send email with Resend if configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      const { error: emailError } = await resend.emails.send({
        from: "Sistema <onboarding@resend.dev>",
        to: [email],
        subject: "Redefinição de Senha Aprovada",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Redefinição de Senha</h1>
              </div>
              <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Olá,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Sua solicitação de redefinição de senha foi <strong>aprovada</strong> por um administrador. 
                  Clique no botão abaixo para definir uma nova senha:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Redefinir Senha
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                </p>
                <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px;">
                  ${resetLink}
                </p>
                <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }

      console.log("Email sent successfully");
    } else {
      console.log("RESEND_API_KEY not configured, skipping email send");
    }

    // Update request status to completed
    await supabaseAdmin
      .from("password_reset_requests")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
