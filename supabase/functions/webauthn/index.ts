// WebAuthn/passkeys com verificação criptográfica real via SimpleWebAuthn.
//
// A implementação anterior armazenava o attestationObject (CBOR) como
// "public_key" e, no login, apenas checava a presença de campos e o challenge
// no clientDataJSON — nunca validou a assinatura. Qualquer cliente podia
// "provar" posse de uma credencial enviando JSON forjado.
//
// Agora register-verify valida attestation (challenge, origin, RP ID, flags) e
// login-verify valida a assertion assinada contra a chave pública COSE
// armazenada, com contador anti-replay (authenticationInfo.newCounter).
//
// Credenciais gravadas antes desta versão têm public_key inválida (o
// attestationObject bruto, não a chave COSE) e falham a verificação — o
// usuário precisa registrar a passkey de novo.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.49.4';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from 'npm:@simplewebauthn/server@14.0.2';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from 'npm:@simplewebauthn/server@14.0.2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  base64urlToBytes,
  bytesToBase64url,
  expectedOrigins,
} from '../_shared/webauthn-helpers.ts';

const RP_NAME = 'PROMO CHAMPIONS';
const RP_ID_HEADER = 'x-rp-id';
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

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
  credential?: RegistrationResponseJSON | AuthenticationResponseJSON;
  credentialId?: string;
  rpId?: string;
}

type ServiceClient = SupabaseClient;

/** Extrai e valida o JWT do chamador; retorna o sub (user id). */
async function getAuthenticatedUserId(
  req: Request,
  supabaseUrl: string,
  anonKey: string
): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

function jsonResponse(payload: unknown, headers: HeadersInit, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

/**
 * Consome um challenge armazenado: só retorna true se ele existir, não estiver
 * expirado e pertencer ao escopo esperado — e o apaga para impedir replay.
 */
function challengeConsumer(
  supabase: ServiceClient,
  type: 'registration' | 'authentication',
  userId?: string
) {
  return async (challenge: string): Promise<boolean> => {
    let query = supabase
      .from('webauthn_challenges')
      .select('id')
      .eq('challenge', challenge)
      .eq('type', type)
      .gt('expires_at', new Date().toISOString());
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data } = await query.maybeSingle();
    if (!data) return false;
    await supabase.from('webauthn_challenges').delete().eq('id', data.id);
    return true;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: WebAuthnAction = await req.json();
    const rpId = body.rpId || req.headers.get(RP_ID_HEADER) || new URL(req.url).hostname;
    const origins = expectedOrigins(req.headers.get('Origin'), rpId);

    console.info('WebAuthn action:', body.action, 'RP ID:', rpId);

    // Ações que exigem sessão autenticada
    const requiresAuth = [
      'register-options',
      'register-verify',
      'list-credentials',
      'delete-credential',
    ];
    if (requiresAuth.includes(body.action)) {
      const callerUserId = await getAuthenticatedUserId(
        req,
        supabaseUrl,
        supabaseAnonKey
      );
      if (!callerUserId) {
        return jsonResponse({ error: 'Unauthorized' }, corsHeaders, 401);
      }
      if (body.userId && body.userId !== callerUserId) {
        return jsonResponse({ error: 'Forbidden: userId mismatch' }, corsHeaders, 403);
      }
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

        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: rpId,
          userName: body.userEmail,
          userID: new TextEncoder().encode(body.userId),
          userDisplayName: body.userEmail.split('@')[0],
          attestationType: 'none',
          authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
          },
          excludeCredentials: (existingCreds ?? []).map(c => ({
            id: c.credential_id as string,
            transports: ['internal'],
          })),
        });

        await supabase.from('webauthn_challenges').insert({
          user_id: body.userId,
          user_email: body.userEmail,
          challenge: options.challenge,
          type: 'registration',
          expires_at: new Date(Date.now() + CHALLENGE_TTL_MS).toISOString(),
        });

        // Limpeza oportunista de challenges vencidos
        await supabase
          .from('webauthn_challenges')
          .delete()
          .lt('expires_at', new Date().toISOString());

        return jsonResponse(options, corsHeaders);
      }

      case 'register-verify': {
        if (!body.userId || !body.credential) {
          throw new Error('userId and credential are required');
        }

        const verification = await verifyRegistrationResponse({
          response: body.credential as RegistrationResponseJSON,
          expectedChallenge: challengeConsumer(supabase, 'registration', body.userId),
          expectedOrigin: origins,
          expectedRPID: rpId,
          requireUserVerification: false,
        });

        if (!verification.verified || !verification.registrationInfo) {
          throw new Error('Falha na verificação do registro da passkey');
        }

        const { credential, credentialDeviceType, credentialBackedUp } =
          verification.registrationInfo;

        const { error: insertError } = await supabase
          .from('webauthn_credentials')
          .insert({
            user_id: body.userId,
            credential_id: credential.id,
            public_key: bytesToBase64url(credential.publicKey),
            counter: credential.counter,
            device_type:
              credentialDeviceType === 'multiDevice' ? 'platform' : 'cross-platform',
            backed_up: credentialBackedUp,
            transports: credential.transports ?? ['internal'],
            friendly_name: `Passkey ${new Date().toLocaleDateString('pt-BR')}`,
          });

        if (insertError) {
          console.error('Error storing credential:', insertError);
          throw new Error('Failed to store credential');
        }

        return jsonResponse({ success: true }, corsHeaders);
      }

      case 'login-options': {
        let allowCredentials: { id: string; transports?: string[] }[] | undefined;

        if (body.userEmail) {
          const { data: userData } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          const user = userData?.users?.find(u => u.email === body.userEmail);

          if (user) {
            const { data: userCreds } = await supabase
              .from('webauthn_credentials')
              .select('credential_id, transports')
              .eq('user_id', user.id);

            allowCredentials = (userCreds ?? []).map(c => ({
              id: c.credential_id as string,
              transports: (c.transports as string[] | null) ?? ['internal'],
            }));
          }
        }

        const options = await generateAuthenticationOptions({
          rpID: rpId,
          userVerification: 'preferred',
          allowCredentials:
            allowCredentials && allowCredentials.length > 0
              ? allowCredentials
              : undefined,
        });

        // Challenge de autenticação fica desvinculado de user_id: o usuário só
        // é resolvido no login-verify, pela credencial apresentada.
        await supabase.from('webauthn_challenges').insert({
          user_email: body.userEmail ?? null,
          challenge: options.challenge,
          type: 'authentication',
          expires_at: new Date(Date.now() + CHALLENGE_TTL_MS).toISOString(),
        });

        return jsonResponse(options, corsHeaders);
      }

      case 'login-verify': {
        if (!body.credential) {
          throw new Error('credential is required');
        }

        const assertion = body.credential as AuthenticationResponseJSON;

        const { data: credData, error: credError } = await supabase
          .from('webauthn_credentials')
          .select('*')
          .eq('credential_id', assertion.id)
          .maybeSingle();

        if (credError || !credData) {
          throw new Error('Credential not found');
        }

        const verification = await verifyAuthenticationResponse({
          response: assertion,
          expectedChallenge: challengeConsumer(supabase, 'authentication'),
          expectedOrigin: origins,
          expectedRPID: rpId,
          requireUserVerification: false,
          credential: {
            id: credData.credential_id as string,
            publicKey: base64urlToBytes(credData.public_key as string),
            counter: credData.counter as number,
            transports: (credData.transports as string[] | null) ?? undefined,
          },
        });

        if (!verification.verified) {
          throw new Error('Falha na verificação da passkey');
        }

        await supabase
          .from('webauthn_credentials')
          .update({
            last_used_at: new Date().toISOString(),
            counter: verification.authenticationInfo.newCounter,
          })
          .eq('id', credData.id);

        const { data: userData } = await supabase.auth.admin.getUserById(
          credData.user_id as string
        );
        if (!userData?.user) {
          throw new Error('User not found');
        }

        const { data: signInData, error: signInError } =
          await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: userData.user.email!,
          });

        if (signInError) {
          console.error('Error generating sign in link:', signInError);
          throw new Error('Failed to generate authentication token');
        }

        return jsonResponse(
          {
            success: true,
            userId: credData.user_id,
            email: userData.user.email,
            token: signInData.properties?.hashed_token,
            actionLink: signInData.properties?.action_link,
          },
          corsHeaders
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

        return jsonResponse({ credentials: data }, corsHeaders);
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

        return jsonResponse({ success: true }, corsHeaders);
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('WebAuthn error:', error);
    return jsonResponse({ error: errorMessage }, corsHeaders, 400);
  }
};

Deno.serve(withRequestId('webauthn', handler));
