import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ActionType = 'password_change' | 'email_change' | 'mfa_config' | 'admin_action' | 'delete_account';

interface ReauthRequest {
  id: string;
  user_id: string;
  action_type: ActionType;
  verified: boolean;
  verified_at: string | null;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useReauthentication = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ReauthRequest | null>(null);

  // Verificar se ação requer re-autenticação
  const requiresReauth = useCallback((_action: ActionType): boolean => {
    // Todas as ações sensíveis requerem re-autenticação
    return true;
  }, []);

  // Iniciar processo de re-autenticação
  const requestReauth = useCallback(async (action: ActionType): Promise<string | null> => {
    if (!user) return null;

    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      const { data, error } = await supabase
        .from('reauthentication_requests')
        .insert({
          user_id: user.id,
          action_type: action,
          expires_at: expiresAt.toISOString(),
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;

      setPendingRequest(data as ReauthRequest);
      return data.id;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating reauth request:', error);
      }
      toast.error('Erro ao solicitar re-autenticação');
      return null;
    }
  }, [user]);

  // Verificar senha para re-autenticação
  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!user || !pendingRequest) return false;

    setIsVerifying(true);

    try {
      // Usar signInWithPassword para verificar
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password,
      });

      if (error) {
        toast.error('Senha incorreta');
        return false;
      }

      // Marcar request como verificada
      const { error: updateError } = await supabase
        .from('reauthentication_requests')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', pendingRequest.id);

      if (updateError) throw updateError;

      toast.success('Re-autenticação bem sucedida');
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying password:', error);
      }
      toast.error('Erro na verificação');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [user, pendingRequest]);

  // Verificar se request ainda é válida
  const isRequestValid = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('reauthentication_requests')
        .select('*')
        .eq('id', requestId)
        .eq('verified', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }, []);

  // Cancelar request pendente
  const cancelRequest = useCallback(async () => {
    if (!pendingRequest) return;

    try {
      await supabase
        .from('reauthentication_requests')
        .delete()
        .eq('id', pendingRequest.id);

      setPendingRequest(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error canceling reauth request:', error);
      }
    }
  }, [pendingRequest]);

  // Executar ação protegida
  const executeProtectedAction = useCallback(async <T>(
    action: ActionType,
    callback: () => Promise<T>
  ): Promise<{ success: boolean; result?: T; requiresReauth: boolean }> => {
    if (!user) return { success: false, requiresReauth: false };

    // Verificar se há request válida
    if (pendingRequest && await isRequestValid(pendingRequest.id)) {
      try {
        const result = await callback();
        setPendingRequest(null);
        return { success: true, result, requiresReauth: false };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error executing protected action:', error);
        }
        return { success: false, requiresReauth: false };
      }
    }

    // Requer nova re-autenticação
    await requestReauth(action);
    return { success: false, requiresReauth: true };
  }, [user, pendingRequest, isRequestValid, requestReauth]);

  return {
    isVerifying,
    pendingRequest,
    requiresReauth,
    requestReauth,
    verifyPassword,
    isRequestValid,
    cancelRequest,
    executeProtectedAction,
  };
};
