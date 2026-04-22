import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const BITRIX24_DOMAIN = Deno.env.get("BITRIX24_DOMAIN");
const BITRIX24_CLIENT_ID = Deno.env.get("BITRIX24_CLIENT_ID");
const BITRIX24_CLIENT_SECRET = Deno.env.get("BITRIX24_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const action = url.searchParams.get("action");

    if (!BITRIX24_DOMAIN || !BITRIX24_CLIENT_ID || !BITRIX24_CLIENT_SECRET) {
      throw new Error("Bitrix24 credentials not configured");
    }

    // Generate authorization URL
    if (action === "authorize") {
      const redirectUri = `${SUPABASE_URL}/functions/v1/bitrix24-oauth`;
      const authUrl = `https://${BITRIX24_DOMAIN}/oauth/authorize/?client_id=${BITRIX24_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle OAuth callback with authorization code
    if (code) {
      const redirectUri = `${SUPABASE_URL}/functions/v1/bitrix24-oauth`;
      
      const tokenResponse = await fetch(`https://${BITRIX24_DOMAIN}/oauth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: BITRIX24_CLIENT_ID,
          client_secret: BITRIX24_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get access token: ${errorText}`);
      }

      const tokens = await tokenResponse.json();
      
      // Store tokens in portfolio_settings
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      
      await supabase.from("portfolio_settings").upsert([
        {
          setting_key: "bitrix24_access_token",
          setting_value: tokens.access_token,
          description: "Bitrix24 OAuth2 access token",
        },
        {
          setting_key: "bitrix24_refresh_token",
          setting_value: tokens.refresh_token,
          description: "Bitrix24 OAuth2 refresh token",
        },
        {
          setting_key: "bitrix24_token_expires",
          setting_value: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          description: "Bitrix24 token expiration time",
        },
      ], { onConflict: "setting_key" });

      // Return success HTML page
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Bitrix24 Autorizado</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: #fff; }
            .container { text-align: center; padding: 2rem; }
            .success { color: #10b981; font-size: 3rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 0.5rem; }
            p { color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Autorização Concluída!</h1>
            <p>A integração com Bitrix24 foi configurada com sucesso.</p>
            <p>Você pode fechar esta janela.</p>
          </div>
        </body>
        </html>`,
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Refresh token
    if (action === "refresh") {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      
      const { data: refreshTokenData } = await supabase
        .from("portfolio_settings")
        .select("setting_value")
        .eq("setting_key", "bitrix24_refresh_token")
        .single();

      if (!refreshTokenData?.setting_value) {
        throw new Error("No refresh token available");
      }

      const tokenResponse = await fetch(`https://${BITRIX24_DOMAIN}/oauth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: BITRIX24_CLIENT_ID,
          client_secret: BITRIX24_CLIENT_SECRET,
          refresh_token: refreshTokenData.setting_value,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to refresh token: ${errorText}`);
      }

      const tokens = await tokenResponse.json();
      
      await supabase.from("portfolio_settings").upsert([
        {
          setting_key: "bitrix24_access_token",
          setting_value: tokens.access_token,
          description: "Bitrix24 OAuth2 access token",
        },
        {
          setting_key: "bitrix24_refresh_token",
          setting_value: tokens.refresh_token,
          description: "Bitrix24 OAuth2 refresh token",
        },
        {
          setting_key: "bitrix24_token_expires",
          setting_value: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          description: "Bitrix24 token expiration time",
        },
      ], { onConflict: "setting_key" });

      return new Response(
        JSON.stringify({ success: true, message: "Token refreshed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check connection status
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { data: tokenData } = await supabase
      .from("portfolio_settings")
      .select("setting_value")
      .eq("setting_key", "bitrix24_access_token")
      .single();

    const { data: expiresData } = await supabase
      .from("portfolio_settings")
      .select("setting_value")
      .eq("setting_key", "bitrix24_token_expires")
      .single();

    const isConnected = !!tokenData?.setting_value;
    const expiresAt = expiresData?.setting_value;
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : true;

    return new Response(
      JSON.stringify({
        connected: isConnected && !isExpired,
        needsReauth: isConnected && isExpired,
        domain: BITRIX24_DOMAIN,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bitrix24 OAuth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
