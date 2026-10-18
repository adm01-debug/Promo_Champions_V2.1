import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EmailOtpType } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  bufferToBase64url,
  base64urlToBuffer,
  getRpId,
  isWebAuthnSupported,
} from './webAuthnUtils';

interface WebAuthnCredential {
  id: string;
  friendly_name: string;
  device_type: string;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
}

// Kill switch: a Edge Function `webauthn` faz verificação criptográfica real
// (SimpleWebAuthn). Se ela precisar ser desligada de novo, volte para false.
const PASSKEYS_AVAILABLE = true;

export function useWebAuthn() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [loadError, setLoadError] = useState<Error | null>(null);
  // Credenciais são dados do usuário: resposta atrasada ou callback de
  // closure antiga jamais escreve na sessão de outro usuário.
  const userRef = useRef(user);
  userRef.current = user;
  // Contador de operação: o finally de uma operação da sessão antiga não
  // pode liberar o loading de uma operação nova da sessão atual.
  const opRef = useRef(0);

  // Ajuste durante o render: credenciais de A não podem aparecer nem uma
  // vez na tela de B — useEffect limpa só depois do commit.
  const [ownerId, setOwnerId] = useState<string | null>(user?.id ?? null);
  const currentId = user?.id ?? null;
  if (ownerId !== currentId) {
    setOwnerId(currentId);
    setCredentials([]);
    setLoadError(null);
  }

  useEffect(() => {
    // Troca de usuário/logout: descarta a lista do usuário anterior e
    // destrava o loading — operação pendente pertencia à sessão antiga.
    setCredentials([]);
    setLoadError(null);
    setIsLoading(false);
    opRef.current++;
  }, [user?.id]);

  const loadCredentials = useCallback(async () => {
    const uid = userRef.current?.id;
    if (!PASSKEYS_AVAILABLE || !uid) return;
    try {
      const { data, error } = await supabase.functions.invoke('webauthn', {
        body: { action: 'list-credentials', userId: uid },
      });
      if (error) throw error;
      if (userRef.current?.id === uid) {
        setCredentials(data.credentials || []);
        setLoadError(null);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      // Falha de listagem não pode parecer "nenhuma passkey" — expõe erro.
      if (userRef.current?.id === uid) setLoadError(error as Error);
    }
  }, []);

  const registerPasskey = useCallback(
    async (_friendlyName?: string): Promise<boolean> => {
      if (!PASSKEYS_AVAILABLE) {
        toast.error(
          'Passkeys estão temporariamente indisponíveis por manutenção de segurança'
        );
        return false;
      }
      if (!isWebAuthnSupported) {
        toast.error('WebAuthn não é suportado neste navegador');
        return false;
      }
      const uid = user?.id;
      const email = user?.email;
      if (!uid || !email) {
        toast.error('Você precisa estar logado para registrar uma passkey');
        return false;
      }
      const isCurrentUser = () => userRef.current?.id === uid;
      const myOp = ++opRef.current;
      setIsLoading(true);
      try {
        const { data: options, error: optionsError } = await supabase.functions.invoke(
          'webauthn',
          {
            body: {
              action: 'register-options',
              userId: uid,
              userEmail: email,
              rpId: getRpId(),
            },
          }
        );
        if (optionsError) throw optionsError;
        if (!isCurrentUser()) return false;

        const credential = (await navigator.credentials.create({
          publicKey: {
            ...options,
            challenge: base64urlToBuffer(options.challenge),
            user: { ...options.user, id: base64urlToBuffer(options.user.id) },
            excludeCredentials: options.excludeCredentials?.map(
              (c: { id: string; type: string }) => ({ ...c, id: base64urlToBuffer(c.id) })
            ),
          },
        })) as PublicKeyCredential;
        if (!credential) throw new Error('Falha ao criar credencial');
        if (!isCurrentUser()) return false;

        const response = credential.response as AuthenticatorAttestationResponse;
        const { error: verifyError } = await supabase.functions.invoke('webauthn', {
          body: {
            action: 'register-verify',
            userId: uid,
            credential: {
              id: credential.id,
              rawId: bufferToBase64url(credential.rawId),
              type: credential.type,
              authenticatorAttachment: credential.authenticatorAttachment,
              response: {
                clientDataJSON: bufferToBase64url(response.clientDataJSON),
                attestationObject: bufferToBase64url(response.attestationObject),
                transports: response.getTransports?.() || ['internal'],
              },
              clientExtensionResults: credential.getClientExtensionResults(),
            },
            rpId: getRpId(),
          },
        });
        if (verifyError) throw verifyError;
        if (!isCurrentUser()) return false;

        toast.success('Passkey registrada com sucesso!');
        await loadCredentials();
        return true;
      } catch (error: unknown) {
        console.error('Passkey registration error:', error);
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (isCurrentUser()) {
          if (err.name === 'NotAllowedError')
            toast.error('Registro cancelado pelo usuário');
          else if (err.name === 'InvalidStateError')
            toast.error('Esta passkey já está registrada');
          else toast.error(err.message || 'Erro ao registrar passkey');
        }
        return false;
      } finally {
        if (opRef.current === myOp) setIsLoading(false);
      }
    },
    [user, loadCredentials]
  );

  const loginWithPasskey = useCallback(async (email?: string): Promise<boolean> => {
    if (!PASSKEYS_AVAILABLE) {
      toast.error(
        'Passkeys estão temporariamente indisponíveis por manutenção de segurança'
      );
      return false;
    }
    if (!isWebAuthnSupported) {
      toast.error('WebAuthn não é suportado neste navegador');
      return false;
    }
    setIsLoading(true);
    try {
      const { data: options, error: optionsError } = await supabase.functions.invoke(
        'webauthn',
        { body: { action: 'login-options', userEmail: email, rpId: getRpId() } }
      );
      if (optionsError) throw optionsError;

      const credential = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          allowCredentials: options.allowCredentials?.map(
            (c: { id: string; type: string }) => ({ ...c, id: base64urlToBuffer(c.id) })
          ),
        },
      })) as PublicKeyCredential;
      if (!credential) throw new Error('Falha na autenticação');

      const response = credential.response as AuthenticatorAssertionResponse;
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'webauthn',
        {
          body: {
            action: 'login-verify',
            credential: {
              id: credential.id,
              rawId: bufferToBase64url(credential.rawId),
              type: credential.type,
              response: {
                clientDataJSON: bufferToBase64url(response.clientDataJSON),
                authenticatorData: bufferToBase64url(response.authenticatorData),
                signature: bufferToBase64url(response.signature),
                userHandle: response.userHandle
                  ? bufferToBase64url(response.userHandle)
                  : null,
              },
            },
            rpId: getRpId(),
          },
        }
      );
      if (verifyError) throw verifyError;

      if (verifyData.actionLink) {
        const url = new URL(verifyData.actionLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        if (token && type) {
          // Se outra sessão autenticou enquanto o fluxo de passkey estava
          // pendente, verifyOtp sobrescreveria a sessão nova pela antiga.
          const { data: sessionNow } = await supabase.auth.getSession();
          if (sessionNow.session) {
            // Já existe sessão ativa (outro login ganhou a corrida) — não
            // sobrescreve; retorna sucesso silencioso para não confundir.
            return true;
          }
          const { error: signInError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as EmailOtpType,
          });
          // verifyOtp falhando não pode ser tratado como login bem-sucedido.
          if (signInError) throw signInError;
        }
      }

      toast.success('Login com passkey realizado!');
      return true;
    } catch (error: unknown) {
      console.error('Passkey login error:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'NotAllowedError')
        toast.error('Autenticação cancelada pelo usuário');
      else toast.error(err.message || 'Erro ao fazer login com passkey');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePasskey = useCallback(
    async (credentialId: string): Promise<boolean> => {
      if (!PASSKEYS_AVAILABLE) {
        toast.error(
          'Passkeys estão temporariamente indisponíveis por manutenção de segurança'
        );
        return false;
      }
      const uid = user?.id;
      if (!uid) {
        toast.error('Você precisa estar logado');
        return false;
      }
      const isCurrentUser = () => userRef.current?.id === uid;
      const myOp = ++opRef.current;
      setIsLoading(true);
      try {
        const { error } = await supabase.functions.invoke('webauthn', {
          body: { action: 'delete-credential', userId: uid, credentialId },
        });
        if (error) throw error;
        if (!isCurrentUser()) return false;
        toast.success('Passkey removida com sucesso');
        await loadCredentials();
        return true;
      } catch (error: unknown) {
        console.error('Error deleting passkey:', error);
        if (isCurrentUser())
          toast.error(error instanceof Error ? error.message : 'Erro ao remover passkey');
        return false;
      } finally {
        if (opRef.current === myOp) setIsLoading(false);
      }
    },
    [user?.id, loadCredentials]
  );

  return {
    isSupported: isWebAuthnSupported,
    isAvailable: PASSKEYS_AVAILABLE,
    isLoading,
    loadError,
    credentials,
    registerPasskey,
    loginWithPasskey,
    deletePasskey,
    loadCredentials,
  };
}
