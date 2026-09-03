import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Salesperson {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  commission_rate: number;
  notify_sales_in_app: boolean | null;
  notify_sales_email: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  salesperson: Salesperson | null;
  isLoading: boolean;
  refreshSalesperson: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [salesperson, setSalesperson] = useState<Salesperson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef<string | null>(null);

  const fetchSalesperson = useCallback(async (authUserId: string, force = false) => {
    if (!force && fetchedRef.current === authUserId) return;

    try {
      const { data, error } = await supabase
        .from('salespeople')
        .select(
          'id, name, email, avatar_url, role, commission_rate, notify_sales_in_app, notify_sales_email'
        )
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSalesperson(data);
        fetchedRef.current = authUserId;
      } else {
        // User is logged in but has no salesperson record
        setSalesperson(null);
        fetchedRef.current = authUserId;
      }
    } catch (error) {
      console.error('Error fetching salesperson profile:', error);
      // Reset ref so we can try again on next mount/refresh
      fetchedRef.current = null;
    }
  }, []);

  const refreshSalesperson = useCallback(async () => {
    if (user?.id) {
      await fetchSalesperson(user.id, true);
    }
  }, [user, fetchSalesperson]);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          void fetchSalesperson(session.user.id);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        void fetchSalesperson(session.user.id);
      } else {
        setSalesperson(null);
        fetchedRef.current = null;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSalesperson]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSalesperson(null);
    setUser(null);
    setSession(null);
    fetchedRef.current = null;
    try {
      await caches.delete('api-cache');
    } catch {
      /* SW not available */
    }
    window.location.href = '/auth';
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      salesperson,
      isLoading,
      refreshSalesperson,
      signIn,
      signOut,
    }),
    [user, session, salesperson, isLoading, refreshSalesperson, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
