import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { detectDeviceInfo, getStoredSessionId, setStoredSessionId, clearStoredSessionId } from './sessionHelpers';

interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_info: Record<string, any> | null;
  last_activity: string;
  created_at: string;
  expires_at: string | null;
  refresh_count: number;
  last_refresh_at: string | null;
  max_lifetime_hours: number;
}

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

export const useSessionManagement = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDeviceInfo = useCallback(() => detectDeviceInfo(), []);

  // Criar nova sessão
  const createSession = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const deviceInfo = getDeviceInfo();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      const sessionToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from('active_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          user_agent: navigator.userAgent,
          device_info: deviceInfo,
          expires_at: expiresAt.toISOString(),
          last_activity: new Date().toISOString(),
          max_lifetime_hours: 24,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data as ActiveSession);
      
      // Salvar token no localStorage
      setStoredSessionId(data.id);
      
      return data.id;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating session:', error);
      }
      return null;
    }
  }, [user, getDeviceInfo]);

  // Carregar sessões ativas
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as ActiveSession[]);

      // Identificar sessão atual
      const currentSessionId = getStoredSessionId();
      if (currentSessionId) {
        const current = data?.find(s => s.id === currentSessionId);
        if (current) {
          setCurrentSession(current as ActiveSession);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching sessions:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Atualizar atividade da sessão
  const updateActivity = useCallback(async () => {
    const sessionId = getStoredSessionId();
    if (!sessionId || !user) return;

    try {
      await supabase
        .from('active_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating activity:', error);
      }
    }
  }, [user]);

  // Refresh da sessão
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const sessionId = getStoredSessionId();
    if (!sessionId) return false;

    try {
      const { data, error } = await supabase.rpc('refresh_session', { 
        session_id: sessionId 
      });

      if (error) throw error;

      if (data) {
        await fetchSessions();
        return true;
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error refreshing session:', error);
      }
      return false;
    }
  }, [fetchSessions]);

  // Validar sessão
  const validateSession = useCallback(async (): Promise<{ valid: boolean; needsRefresh: boolean }> => {
    const sessionId = getStoredSessionId();
    if (!sessionId) return { valid: false, needsRefresh: false };

    try {
      const { data, error } = await supabase.rpc('validate_session', { 
        session_id: sessionId 
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        return { valid: result.valid, needsRefresh: result.needs_refresh };
      }
      return { valid: false, needsRefresh: false };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error validating session:', error);
      }
      return { valid: false, needsRefresh: false };
    }
  }, []);

  // Encerrar sessão específica
  const terminateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Se for a sessão atual, fazer logout
      if (sessionId === getStoredSessionId()) {
        clearStoredSessionId();
        await supabase.auth.signOut();
        toast.info('Sessão encerrada');
      } else {
        toast.success('Sessão encerrada');
      }

      await fetchSessions();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error terminating session:', error);
      }
      toast.error('Erro ao encerrar sessão');
      return false;
    }
  }, [fetchSessions]);

  // Encerrar todas as outras sessões
  const terminateOtherSessions = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const currentSessionId = getStoredSessionId();

    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('id', currentSessionId || '');

      if (error) throw error;

      toast.success('Outras sessões encerradas');
      await fetchSessions();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error terminating other sessions:', error);
      }
      toast.error('Erro ao encerrar sessões');
      return false;
    }
  }, [user, fetchSessions]);

  // Verificação periódica da sessão
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const { valid, needsRefresh } = await validateSession();

      if (!valid) {
        toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
        clearStoredSessionId();
        await supabase.auth.signOut();
        return;
      }

      if (needsRefresh) {
        const refreshed = await refreshSession();
        if (refreshed && import.meta.env.DEV) {
          void 0;
        }
      }
    };

    // Verificar imediatamente
    checkSession();

    // Configurar intervalo
    checkIntervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Atualizar atividade em interações
    const handleActivity = () => updateActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [user, validateSession, refreshSession, updateActivity]);

  // Carregar sessões ao montar
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Criar sessão ao fazer login
  useEffect(() => {
    if (user && !getStoredSessionId()) {
      createSession();
    }
  }, [user, createSession]);

  return {
    sessions,
    currentSession,
    isLoading,
    createSession,
    refreshSession,
    validateSession,
    terminateSession,
    terminateOtherSessions,
    updateActivity,
    refetch: fetchSessions,
  };
};
