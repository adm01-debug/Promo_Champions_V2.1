import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WebAuthnCredential {
  id: string;
  friendly_name: string;
  device_type: string;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface UseWebAuthnReturn {
  isSupported: boolean;
  isLoading: boolean;
  credentials: WebAuthnCredential[];
  registerPasskey: (friendlyName?: string) => Promise<boolean>;
  loginWithPasskey: (email?: string) => Promise<boolean>;
  deletePasskey: (credentialId: string) => Promise<boolean>;
  loadCredentials: () => Promise<void>;
}

export function useWebAuthn(): UseWebAuthnReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);

  // Check if WebAuthn is supported
  const isSupported = typeof window !== 'undefined' && 
    'credentials' in navigator && 
    'PublicKeyCredential' in window;

  // Get RP ID from current hostname
  const getRpId = () => {
    if (typeof window === 'undefined') return 'localhost';
    return window.location.hostname;
  };

  // Convert ArrayBuffer to base64url
  const bufferToBase64url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Convert base64url to ArrayBuffer
  const base64urlToBuffer = (base64url: string): ArrayBuffer => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Load user's passkeys
  const loadCredentials = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('webauthn', {
        body: { action: 'list-credentials', userId: user.id },
      });

      if (error) throw error;
      setCredentials(data.credentials || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading credentials:', error);
      }
    }
  }, [user?.id]);

  // Register a new passkey
  const registerPasskey = useCallback(async (friendlyName?: string): Promise<boolean> => {
    if (!isSupported) {
      toast.error('WebAuthn não é suportado neste navegador');
      return false;
    }

    if (!user?.id || !user?.email) {
      toast.error('Você precisa estar logado para registrar uma passkey');
      return false;
    }

    setIsLoading(true);

    try {
      // Get registration options from server
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn', {
        body: {
          action: 'register-options',
          userId: user.id,
          userEmail: user.email,
          rpId: getRpId(),
        },
      });

      if (optionsError) throw optionsError;

      // Prepare options for WebAuthn API
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...options.user,
          id: new TextEncoder().encode(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((c: any) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      };

      // Create credential using browser API
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha ao criar credencial');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Prepare credential for server verification
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: (credential as any).authenticatorAttachment,
        response: {
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          attestationObject: bufferToBase64url(response.attestationObject),
          transports: response.getTransports?.() || ['internal'],
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      };

      // Verify with server
      const { error: verifyError } = await supabase.functions.invoke('webauthn', {
        body: {
          action: 'register-verify',
          userId: user.id,
          credential: credentialData,
          rpId: getRpId(),
        },
      });

      if (verifyError) throw verifyError;

      toast.success('Passkey registrada com sucesso!');
      await loadCredentials();
      return true;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        console.error('Passkey registration error:', error);
      }
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'NotAllowedError') {
        toast.error('Registro cancelado pelo usuário');
      } else if (err.name === 'InvalidStateError') {
        toast.error('Esta passkey já está registrada');
      } else {
        toast.error(err.message || 'Erro ao registrar passkey');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, loadCredentials]);

  // Login with passkey
  const loginWithPasskey = useCallback(async (email?: string): Promise<boolean> => {
    if (!isSupported) {
      toast.error('WebAuthn não é suportado neste navegador');
      return false;
    }

    setIsLoading(true);

    try {
      // Get authentication options from server
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn', {
        body: {
          action: 'login-options',
          userEmail: email,
          rpId: getRpId(),
        },
      });

      if (optionsError) throw optionsError;

      // Prepare options for WebAuthn API
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((c: any) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      };

      // Get credential using browser API
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha na autenticação');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Prepare credential for server verification
      const credentialData = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          authenticatorData: bufferToBase64url(response.authenticatorData),
          signature: bufferToBase64url(response.signature),
          userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
        },
      };

      // Verify with server
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('webauthn', {
        body: {
          action: 'login-verify',
          credential: credentialData,
          rpId: getRpId(),
        },
      });

      if (verifyError) throw verifyError;

      // Use the action link to sign in
      if (verifyData.actionLink) {
        // Extract token from action link and sign in
        const url = new URL(verifyData.actionLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        if (token && type) {
          const { error: signInError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          });
          
          if (signInError) {
            if (import.meta.env.DEV) {
              console.error('Sign in error:', signInError);
            }
            // Try alternative sign in method
          }
        }
      }

      toast.success('Login com passkey realizado!');
      return true;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        console.error('Passkey login error:', error);
      }
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'NotAllowedError') {
        toast.error('Autenticação cancelada pelo usuário');
      } else {
        toast.error(err.message || 'Erro ao fazer login com passkey');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Delete a passkey
  const deletePasskey = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return false;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('webauthn', {
        body: {
          action: 'delete-credential',
          userId: user.id,
          credentialId,
        },
      });

      if (error) throw error;

      toast.success('Passkey removida com sucesso');
      await loadCredentials();
      return true;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        console.error('Error deleting passkey:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Erro ao remover passkey');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadCredentials]);

  return {
    isSupported,
    isLoading,
    credentials,
    registerPasskey,
    loginWithPasskey,
    deletePasskey,
    loadCredentials,
  };
}
