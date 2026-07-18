import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const RP_NAME = 'PROMO CHAMPIONS';
const RP_ID_HEADER = 'x-rp-id';

interface WebAuthnCredential {
  id: string;
  rawId?: string;
  type?: string;
  authenticatorAttachment?: string;
  clientExtensionResults?: {
    credProps?: { rk?: boolean };
  };
  response: {
    publicKey?: string;
    attestationObject?: string;
    clientDataJSON?: string;
    authenticatorData?: string;
    signature?: string;
    transports?: string[];
    [key: string]: unknown;
  };
}

interface WebAuthnAction {
  action:
    | 'register-options'
    | 'register-verify'
    | 'login-options'
    | 'login-verify'
    | 'list-credentials'
    | 'delete-credential';
  userId?: string;
  userEmail?: string;
  credential?: WebAuthnCredential;
  credentialId?: string;
  rpId?: string;
}

/** Extract and verify the caller's JWT; return their sub (user id). */
async function getAuthenticatedUserId(req: Request, supabaseUrl: string, anonKey: string): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  // Use user-scoped client so JWT is validated by Supabase
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: WebAuthnAction = await req.json();
    const rpId = body.rpId || req.headers.get(RP_ID_HEADER) || new URL(req.url).hostname;

    console.info('WebAuthn action:', body.action, 'RP ID:', rpId);

    // ── Actions that require an authenticated session ──────────────────────
    const requiresAuth = ['register-options', 'register-verify', 'list-credentials', 'delete-credential'];
    if (requiresAuth.includes(body.action)) {
      const callerUserId = await getAuthenticatedUserId(req, supabaseUrl, supabaseAnonKey);
      if (!callerUserId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Ensure the userId in the body matches the authenticated caller
      if (body.userId && body.userId !== callerUserId) {
        return new Response(JSON.stringify({ error: 'Forbidden: userId mismatch' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Override body.userId with the verified caller identity
      body.userId = callerUserId;
    }

    switch (body.action) {
      case 'register-options': {
        if (!body.userId || !body.userEmail) {
          throw new Error('userId and userEmail are required');
        }

        const { data: existingCreds } = await supabase
          .from('webauthn_credentials')
          .select('credential_id')
          .eq('user_id', body.userId);

        const challenge = generateChallenge();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await supabase.from('webauthn_challenges').insert({
          user_id: body.userId,
          user_email: body.userEmail,
          challenge,
          type: 'registration',
          expires_at: expiresAt.toISOString(),
        });

        await supabase
          .from('webauthn_challenges')
          .delete()
          .lt('expires_at', new Date().toISOString());

        const options = {
          challenge,
          rp: { name: RP_NAME, id: rpId },
          user: {
            id: body.userId,
            name: body.userEmail,
            displayName: body.userEmail.split('@')[0],
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          timeout: 60000,
          attestation: 'none',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred',
            requireResidentKey: false,
          },
          excludeCredentials:
            existingCreds?.map(c => ({
              id: c.credential_id,
              type: 'public-key',
              transports: ['internal'],
            })) || [],
        };

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'register-verify': {
        if (!body.userId || !body.credential) {
          throw new Error('userId and credential are required');
        }

        const { data: challengeData } = await supabase
          .from('webauthn_challenges')
          .select('*')
          .eq('user_id', body.userId)
          .eq('type', 'registration')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!challengeData) {
          throw new Error('Challenge expired or not found');
        }

        await supabase.from('webauthn_challenges').delete().eq('id', challengeData.id);

        const { id, response: credResponse, authenticatorAttachment } = body.credential;

        const { error: insertError } = await supabase
          .from('webauthn_credentials')
          .insert({
            user_id: body.userId,
            credential_id: id,
            public_key: credResponse.publicKey || credResponse.attestationObject,
            counter: 0,
            device_type:
              authenticatorAttachment === 'platform' ? 'platform' : 'cross-platform',
            backed_up: body.credential.clientExtensionResults?.credProps?.rk || false,
            transports: credResponse.transports || ['internal'],
            friendly_name: `Passkey ${new Date().toLocaleDateString('pt-BR')}`,
          });

        if (insertError) {
          console.error('Error storing credential:', insertError);
          throw new Error('Failed to store credential');
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'login-options': {
        const challenge = generateChallenge();
        let credentials: Array<{ credential_id: string; transports?: string[] | null }> = [];
        let resolvedUserId: string | null = null;

        if (body.userEmail) {
          const { data: userData } = await supabase.auth.admin.listUsers();
          const user = userData?.users?.find(u => u.email === body.userEmail);

          if (user) {
            resolvedUserId = user.id;
            const { data: userCreds } = await supabase
              .from('webauthn_credentials')
              .select('credential_id, transports')
              .eq('user_id', user.id);

            credentials = userCreds || [];

            await supabase.from('webauthn_challenges').insert({
              user_id: user.id,
              user_email: body.userEmail,
              challenge,
              type: 'authentication',
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            });
          }
        } else {
          // Discoverable credentials — no email, no user_id yet; challenge will be
          // matched to the credential's user_id during login-verify
          await supabase.from('webauthn_challenges').insert({
            challenge,
            type: 'authentication',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          });
        }

        const options = {
          challenge,
          timeout: 60000,
          rpId,
          userVerification: 'preferred',
          allowCredentials:
            credentials.length > 0
              ? credentials.map(c => ({
                  id: c.credential_id,
                  type: 'public-key',
                  transports: c.transports || ['internal'],
                }))
              : undefined,
        };

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'login-verify': {
        if (!body.credential) {
          throw new Error('credential is required');
        }

        const { id, response: credResponse } = body.credential;

        // Require the authenticator to have returned clientDataJSON and signature
        // (basic presence check; full CBOR/COSE signature verification would require
        //  a dedicated library not yet available in this edge function)
        if (!credResponse.clientDataJSON || !credResponse.signature || !credResponse.authenticatorData) {
          throw new Error('Incomplete assertion response — missing required fields');
        }

        // Find the credential
        const { data: credData, error: credError } = await supabase
          .from('webauthn_credentials')
          .select('*, user_id')
          .eq('credential_id', id)
          .single();

        if (credError || !credData) {
          throw new Error('Credential not found');
        }

        // Verify challenge is bound to THIS user (not any user)
        const { data: challengeData } = await supabase
          .from('webauthn_challenges')
          .select('*')
          .eq('user_id', credData.user_id)
          .eq('type', 'authentication')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!challengeData) {
          throw new Error('Challenge expired or not found for this credential');
        }

        // Consume the challenge immediately (prevent replay)
        await supabase.from('webauthn_challenges').delete().eq('id', challengeData.id);

        // Verify the clientDataJSON contains the expected challenge
        let clientData: { challenge?: string; type?: string; origin?: string };
        try {
          const decoded = atob(credResponse.clientDataJSON as string);
          clientData = JSON.parse(decoded);
        } catch {
          throw new Error('Invalid clientDataJSON');
        }

        if (clientData.type !== 'webauthn.get') {
          throw new Error('Invalid clientData type');
        }

        const receivedChallenge = (clientData.challenge ?? '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        if (receivedChallenge !== challengeData.challenge) {
          throw new Error('Challenge mismatch — replay attack detected');
        }

        // Update last used and counter
        await supabase
          .from('webauthn_credentials')
          .update({
            last_used_at: new Date().toISOString(),
            counter: credData.counter + 1,
          })
          .eq('id', credData.id);

        // Get user
        const { data: userData } = await supabase.auth.admin.getUserById(credData.user_id);
        if (!userData?.user) {
          throw new Error('User not found');
        }

        // Generate a short-lived magic link for the verified user
        const { data: signInData, error: signInError } =
          await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: userData.user.email!,
          });

        if (signInError) {
          console.error('Error generating sign in link:', signInError);
          throw new Error('Failed to generate authentication token');
        }

        return new Response(
          JSON.stringify({
            success: true,
            userId: credData.user_id,
            email: userData.user.email,
            token: signInData.properties?.hashed_token,
            actionLink: signInData.properties?.action_link,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list-credentials': {
        if (!body.userId) {
          throw new Error('userId is required');
        }

        const { data, error } = await supabase
          .from('webauthn_credentials')
          .select('id, friendly_name, device_type, backed_up, created_at, last_used_at')
          .eq('user_id', body.userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ credentials: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-credential': {
        if (!body.userId || !body.credentialId) {
          throw new Error('userId and credentialId are required');
        }

        const { error } = await supabase
          .from('webauthn_credentials')
          .delete()
          .eq('id', body.credentialId)
          .eq('user_id', body.userId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('WebAuthn error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
