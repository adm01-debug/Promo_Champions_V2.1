import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';
import {
  getUserClient,
  getServiceClient,
  UnauthorizedError,
  type AuthenticatedContext,
} from '../_shared/auth-client.ts';
import { isInternalServiceRequest } from '../_shared/internal-service-auth.ts';
import {
  createSignedOAuthState,
  verifySignedOAuthState,
} from '../_shared/oauth-state.ts';

const BITRIX24_DOMAIN = Deno.env.get('BITRIX24_DOMAIN');
const BITRIX24_CLIENT_ID = Deno.env.get('BITRIX24_CLIENT_ID');
const BITRIX24_CLIENT_SECRET = Deno.env.get('BITRIX24_CLIENT_SECRET');
const BITRIX24_STATE_SECRET = Deno.env.get('BITRIX24_STATE_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Janela curta do state OAuth: o callback precisa acontecer logo após o
// authorize, então 10 minutos bastam e limitam reuso de URL copiada.
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

async function isAdminOrManager(ctx: AuthenticatedContext): Promise<boolean> {
  const { data, error } = await ctx.client.rpc('is_admin_or_manager' as never, {
    _user_id: ctx.userId,
  } as never);
  if (error) throw new Error(`role_check_failed:${error.message}`);
  return Boolean(data);
}

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(
  withRequestId('bitrix24-oauth', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const action = url.searchParams.get('action');

      if (!BITRIX24_DOMAIN || !BITRIX24_CLIENT_ID || !BITRIX24_CLIENT_SECRET) {
        throw new Error('Bitrix24 credentials not configured');
      }

      // Generate authorization URL — só admin/manager pode iniciar o fluxo.
      if (action === 'authorize') {
        const caller = await getUserClient(req);
        if (!(await isAdminOrManager(caller))) {
          return jsonResponse(
            { error: 'admin_or_manager_role_required' },
            403,
            corsHeaders
          );
        }
        if (!BITRIX24_STATE_SECRET) {
          throw new Error('BITRIX24_STATE_SECRET not configured');
        }

        const state = await createSignedOAuthState(
          caller.userId,
          BITRIX24_STATE_SECRET,
          OAUTH_STATE_TTL_MS
        );
        const redirectUri = `${SUPABASE_URL}/functions/v1/bitrix24-oauth`;
        const authUrl = `https://${BITRIX24_DOMAIN}/oauth/authorize/?client_id=${BITRIX24_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

        return new Response(JSON.stringify({ authUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle OAuth callback with authorization code — exige o state
      // assinado emitido pelo authorize e revalida o papel do usuário.
      if (code) {
        if (!BITRIX24_STATE_SECRET) {
          throw new Error('BITRIX24_STATE_SECRET not configured');
        }
        const state = await verifySignedOAuthState(
          url.searchParams.get('state'),
          BITRIX24_STATE_SECRET
        );
        if (!state) {
          return jsonResponse({ error: 'invalid_or_expired_state' }, 401, corsHeaders);
        }

        // O callback chega do browser do Bitrix24 sem JWT: validamos o papel
        // do usuário embutido no state via service_role antes de gravar tokens.
        const supabase = getServiceClient(
          'callback OAuth Bitrix24: revalida papel do autorizador e grava tokens com bypass de RLS'
        );
        const { data: stillAllowed, error: roleError } = await supabase.rpc(
          'is_admin_or_manager' as never,
          { _user_id: state.userId } as never
        );
        if (roleError) throw new Error(`role_check_failed:${roleError.message}`);
        if (!stillAllowed) {
          return jsonResponse(
            { error: 'admin_or_manager_role_required' },
            403,
            corsHeaders
          );
        }

        const redirectUri = `${SUPABASE_URL}/functions/v1/bitrix24-oauth`;

        const tokenResponse = await withEdgeCircuitBreaker(
          'bitrix24:oauth',
          async () => {
            const r = await fetchWithTimeout(`https://${BITRIX24_DOMAIN}/oauth/token/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: BITRIX24_CLIENT_ID,
                client_secret: BITRIX24_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri,
              }),
            });
            if (r.status >= 500) throw new Error(`bitrix24_5xx_${r.status}`);
            return r;
          },
          { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 35_000 }
        );

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to get access token: ${errorText}`);
        }

        const tokens = await tokenResponse.json();

        // Store tokens in portfolio_settings
        await supabase.from('portfolio_settings').upsert(
          [
            {
              setting_key: 'bitrix24_access_token',
              setting_value: tokens.access_token,
              description: 'Bitrix24 OAuth2 access token',
            },
            {
              setting_key: 'bitrix24_refresh_token',
              setting_value: tokens.refresh_token,
              description: 'Bitrix24 OAuth2 refresh token',
            },
            {
              setting_key: 'bitrix24_token_expires',
              setting_value: new Date(
                Date.now() + tokens.expires_in * 1000
              ).toISOString(),
              description: 'Bitrix24 token expiration time',
            },
          ],
          { onConflict: 'setting_key' }
        );

        // Trilha de auditoria: quem autorizou e quando.
        const { error: auditError } = await supabase.from('audit_logs').insert({
          actor_id: state.userId,
          action: 'bitrix24_oauth_authorized',
          entity_type: 'integration',
          entity_id: 'bitrix24',
          metadata: { domain: BITRIX24_DOMAIN },
        });
        if (auditError) {
          console.error('Bitrix24 OAuth audit log failed:', auditError.message);
        }

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
          { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
        );
      }

      // Refresh token — apenas chamadas internas (service_role) ou admin/manager.
      if (action === 'refresh') {
        if (!isInternalServiceRequest(req)) {
          const caller = await getUserClient(req);
          if (!(await isAdminOrManager(caller))) {
            return jsonResponse(
              { error: 'admin_or_manager_role_required' },
              403,
              corsHeaders
            );
          }
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        const { data: refreshTokenData } = await supabase
          .from('portfolio_settings')
          .select('setting_value')
          .eq('setting_key', 'bitrix24_refresh_token')
          .single();

        if (!refreshTokenData?.setting_value) {
          throw new Error('No refresh token available');
        }

        const tokenResponse = await withEdgeCircuitBreaker(
          'bitrix24:oauth',
          async () => {
            const r = await fetchWithTimeout(`https://${BITRIX24_DOMAIN}/oauth/token/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: BITRIX24_CLIENT_ID,
                client_secret: BITRIX24_CLIENT_SECRET,
                refresh_token: refreshTokenData.setting_value,
              }),
            });
            if (r.status >= 500) throw new Error(`bitrix24_5xx_${r.status}`);
            return r;
          },
          { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 35_000 }
        );

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to refresh token: ${errorText}`);
        }

        const tokens = await tokenResponse.json();

        await supabase.from('portfolio_settings').upsert(
          [
            {
              setting_key: 'bitrix24_access_token',
              setting_value: tokens.access_token,
              description: 'Bitrix24 OAuth2 access token',
            },
            {
              setting_key: 'bitrix24_refresh_token',
              setting_value: tokens.refresh_token,
              description: 'Bitrix24 OAuth2 refresh token',
            },
            {
              setting_key: 'bitrix24_token_expires',
              setting_value: new Date(
                Date.now() + tokens.expires_in * 1000
              ).toISOString(),
              description: 'Bitrix24 token expiration time',
            },
          ],
          { onConflict: 'setting_key' }
        );

        return new Response(
          JSON.stringify({ success: true, message: 'Token refreshed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check connection status
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { data: tokenData } = await supabase
        .from('portfolio_settings')
        .select('setting_value')
        .eq('setting_key', 'bitrix24_access_token')
        .single();

      const { data: expiresData } = await supabase
        .from('portfolio_settings')
        .select('setting_value')
        .eq('setting_key', 'bitrix24_token_expires')
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return jsonResponse({ error: error.message }, 401, corsHeaders);
      }
      if (error instanceof CircuitBreakerOpenError) {
        return new Response(
          JSON.stringify({
            error: 'circuit_open',
            message: 'Bitrix24 temporariamente indisponível',
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      console.error('Bitrix24 OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  })
);
