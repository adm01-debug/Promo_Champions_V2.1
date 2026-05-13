import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { bufferToBase64url, base64urlToBuffer, getRpId, isWebAuthnSupported } from './webAuthnUtils';

interface WebAuthnCredential {
  id: string;
  friendly_name: string;
  device_type: string;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
}

export function useWebAuthn() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);

  const loadCredentials = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.functions.invoke('webauthn', { body: { action: 'list-credentials', userId: user.id } });
      if (error) throw error;
      setCredentials(data.credentials || []);
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }, [user?.id]);

  const registerPasskey = useCallback(async (_friendlyName?: string): Promise<boolean> => {
    if (!isWebAuthnSupported) { toast.error('WebAuthn não é suportado neste navegador'); return false; }
    if (!user?.id || !user?.email) { toast.error('Você precisa estar logado para registrar uma passkey'); return false; }
    setIsLoading(true);
    try {
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn', { body: { action: 'register-options', userId: user.id, userEmail: user.email, rpId: getRpId() } });
      if (optionsError) throw optionsError;

      const credential = await navigator.credentials.create({
        publicKey: { ...options, challenge: base64urlToBuffer(options.challenge), user: { ...options.user, id: new TextEncoder().encode(options.user.id) }, excludeCredentials: options.excludeCredentials?.map((c: { id: string; type: string }) => ({ ...c, id: base64urlToBuffer(c.id) })) },
      }) as PublicKeyCredential;
      if (!credential) throw new Error('Falha ao criar credencial');

      const response = credential.response as AuthenticatorAttestationResponse;
      const { error: verifyError } = await supabase.functions.invoke('webauthn', {
        body: { action: 'register-verify', userId: user.id, credential: { id: credential.id, rawId: bufferToBase64url(credential.rawId), type: credential.type, authenticatorAttachment: (credential as any).authenticatorAttachment, response: { clientDataJSON: bufferToBase64url(response.clientDataJSON), attestationObject: bufferToBase64url(response.attestationObject), transports: response.getTransports?.() || ['internal'] }, clientExtensionResults: credential.getClientExtensionResults() }, rpId: getRpId() },
      });
      if (verifyError) throw verifyError;

      toast.success('Passkey registrada com sucesso!');
      await loadCredentials();
      return true;
    } catch (error: unknown) {
      console.error('Passkey registration error:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'NotAllowedError') toast.error('Registro cancelado pelo usuário');
      else if (err.name === 'InvalidStateError') toast.error('Esta passkey já está registrada');
      else toast.error(err.message || 'Erro ao registrar passkey');
      return false;
    } finally { setIsLoading(false); }
  }, [user, loadCredentials]);

  const loginWithPasskey = useCallback(async (email?: string): Promise<boolean> => {
    if (!isWebAuthnSupported) { toast.error('WebAuthn não é suportado neste navegador'); return false; }
    setIsLoading(true);
    try {
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn', { body: { action: 'login-options', userEmail: email, rpId: getRpId() } });
      if (optionsError) throw optionsError;

      const credential = await navigator.credentials.get({
        publicKey: { ...options, challenge: base64urlToBuffer(options.challenge), allowCredentials: options.allowCredentials?.map((c: { id: string; type: string }) => ({ ...c, id: base64urlToBuffer(c.id) })) },
      }) as PublicKeyCredential;
      if (!credential) throw new Error('Falha na autenticação');

      const response = credential.response as AuthenticatorAssertionResponse;
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('webauthn', {
        body: { action: 'login-verify', credential: { id: credential.id, rawId: bufferToBase64url(credential.rawId), type: credential.type, response: { clientDataJSON: bufferToBase64url(response.clientDataJSON), authenticatorData: bufferToBase64url(response.authenticatorData), signature: bufferToBase64url(response.signature), userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null } }, rpId: getRpId() },
      });
      if (verifyError) throw verifyError;

      if (verifyData.actionLink) {
        const url = new URL(verifyData.actionLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        if (token && type) {
          const { error: signInError } = await supabase.auth.verifyOtp({ token_hash: token, type: type as any });
          if (signInError && import.meta.env.DEV) console.error('Sign in error:', signInError);
        }
      }

      toast.success('Login com passkey realizado!');
      return true;
    } catch (error: unknown) {
      console.error('Passkey login error:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'NotAllowedError') toast.error('Autenticação cancelada pelo usuário');
      else toast.error(err.message || 'Erro ao fazer login com passkey');
      return false;
    } finally { setIsLoading(false); }
  }, []);

  const deletePasskey = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!user?.id) { toast.error('Você precisa estar logado'); return false; }
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('webauthn', { body: { action: 'delete-credential', userId: user.id, credentialId } });
      if (error) throw error;
      toast.success('Passkey removida com sucesso');
      await loadCredentials();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting passkey:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao remover passkey');
      return false;
    } finally { setIsLoading(false); }
  }, [user?.id, loadCredentials]);

  return { isSupported: isWebAuthnSupported, isLoading, credentials, registerPasskey, loginWithPasskey, deletePasskey, loadCredentials };
}
