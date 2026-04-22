import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

// Helper to generate random bytes as base64url
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper to convert base64url to base64
function base64urlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

const RP_NAME = "PROMO CHAMPIONS";
const RP_ID_HEADER = "x-rp-id"; // Will be set from frontend

interface WebAuthnAction {
  action: 'register-options' | 'register-verify' | 'login-options' | 'login-verify' | 'list-credentials' | 'delete-credential';
  userId?: string;
  userEmail?: string;
  credential?: any;
  credentialId?: string;
  rpId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: WebAuthnAction = await req.json();
    const rpId = body.rpId || req.headers.get(RP_ID_HEADER) || new URL(req.url).hostname;
    
    console.log("WebAuthn action:", body.action, "RP ID:", rpId);

    switch (body.action) {
      case 'register-options': {
        if (!body.userId || !body.userEmail) {
          throw new Error("userId and userEmail are required");
        }

        // Get existing credentials for the user
        const { data: existingCreds } = await supabase
          .from("webauthn_credentials")
          .select("credential_id")
          .eq("user_id", body.userId);

        const challenge = generateChallenge();
        
        // Store challenge
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await supabase.from("webauthn_challenges").insert({
          user_id: body.userId,
          user_email: body.userEmail,
          challenge,
          type: 'registration',
          expires_at: expiresAt.toISOString(),
        });

        // Clean up old challenges
        await supabase
          .from("webauthn_challenges")
          .delete()
          .lt("expires_at", new Date().toISOString());

        const options = {
          challenge,
          rp: {
            name: RP_NAME,
            id: rpId,
          },
          user: {
            id: body.userId,
            name: body.userEmail,
            displayName: body.userEmail.split('@')[0],
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },   // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
            residentKey: "preferred",
            requireResidentKey: false,
          },
          excludeCredentials: existingCreds?.map(c => ({
            id: c.credential_id,
            type: "public-key",
            transports: ["internal"],
          })) || [],
        };

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'register-verify': {
        if (!body.userId || !body.credential) {
          throw new Error("userId and credential are required");
        }

        // Verify challenge exists and is valid
        const { data: challengeData } = await supabase
          .from("webauthn_challenges")
          .select("*")
          .eq("user_id", body.userId)
          .eq("type", "registration")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!challengeData) {
          throw new Error("Challenge expired or not found");
        }

        // Delete the used challenge
        await supabase
          .from("webauthn_challenges")
          .delete()
          .eq("id", challengeData.id);

        // Extract credential data
        const { id, rawId, response: credResponse, type, authenticatorAttachment } = body.credential;
        
        // Store the credential
        const { error: insertError } = await supabase
          .from("webauthn_credentials")
          .insert({
            user_id: body.userId,
            credential_id: id,
            public_key: credResponse.publicKey || credResponse.attestationObject,
            counter: 0,
            device_type: authenticatorAttachment === 'platform' ? 'platform' : 'cross-platform',
            backed_up: body.credential.clientExtensionResults?.credProps?.rk || false,
            transports: credResponse.transports || ['internal'],
            friendly_name: `Passkey ${new Date().toLocaleDateString('pt-BR')}`,
          });

        if (insertError) {
          console.error("Error storing credential:", insertError);
          throw new Error("Failed to store credential");
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'login-options': {
        const challenge = generateChallenge();
        
        let credentials: any[] = [];
        
        if (body.userEmail) {
          // Get user by email first
          const { data: userData } = await supabase.auth.admin.listUsers();
          const user = userData?.users?.find(u => u.email === body.userEmail);
          
          if (user) {
            const { data: userCreds } = await supabase
              .from("webauthn_credentials")
              .select("credential_id, transports")
              .eq("user_id", user.id);
            
            credentials = userCreds || [];

            // Store challenge with user info
            await supabase.from("webauthn_challenges").insert({
              user_id: user.id,
              user_email: body.userEmail,
              challenge,
              type: 'authentication',
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            });
          }
        } else {
          // Discoverable credentials (passkey) - no email needed
          await supabase.from("webauthn_challenges").insert({
            challenge,
            type: 'authentication',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          });
        }

        const options = {
          challenge,
          timeout: 60000,
          rpId,
          userVerification: "preferred",
          allowCredentials: credentials.length > 0 ? credentials.map(c => ({
            id: c.credential_id,
            type: "public-key",
            transports: c.transports || ["internal"],
          })) : undefined,
        };

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'login-verify': {
        if (!body.credential) {
          throw new Error("credential is required");
        }

        const { id, rawId, response: authResponse } = body.credential;

        // Find the credential
        const { data: credData, error: credError } = await supabase
          .from("webauthn_credentials")
          .select("*, user_id")
          .eq("credential_id", id)
          .single();

        if (credError || !credData) {
          throw new Error("Credential not found");
        }

        // Verify challenge exists
        const { data: challengeData } = await supabase
          .from("webauthn_challenges")
          .select("*")
          .eq("type", "authentication")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!challengeData) {
          throw new Error("Challenge expired or not found");
        }

        // Delete used challenge
        await supabase
          .from("webauthn_challenges")
          .delete()
          .eq("id", challengeData.id);

        // Update last used and counter
        await supabase
          .from("webauthn_credentials")
          .update({
            last_used_at: new Date().toISOString(),
            counter: credData.counter + 1,
          })
          .eq("id", credData.id);

        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(credData.user_id);
        
        if (!userData?.user) {
          throw new Error("User not found");
        }

        // Generate a magic link or sign in token
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email!,
        });

        if (signInError) {
          console.error("Error generating sign in link:", signInError);
          throw new Error("Failed to generate authentication token");
        }

        return new Response(JSON.stringify({ 
          success: true,
          userId: credData.user_id,
          email: userData.user.email,
          token: signInData.properties?.hashed_token,
          actionLink: signInData.properties?.action_link,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'list-credentials': {
        if (!body.userId) {
          throw new Error("userId is required");
        }

        const { data, error } = await supabase
          .from("webauthn_credentials")
          .select("id, friendly_name, device_type, backed_up, created_at, last_used_at")
          .eq("user_id", body.userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ credentials: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'delete-credential': {
        if (!body.userId || !body.credentialId) {
          throw new Error("userId and credentialId are required");
        }

        const { error } = await supabase
          .from("webauthn_credentials")
          .delete()
          .eq("id", body.credentialId)
          .eq("user_id", body.userId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("WebAuthn error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
