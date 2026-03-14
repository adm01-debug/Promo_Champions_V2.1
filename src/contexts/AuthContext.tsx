import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Salesperson {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  commission_rate: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  salesperson: Salesperson | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [salesperson, setSalesperson] = useState<Salesperson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSalesperson = useCallback(async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, email, avatar_url, role, commission_rate")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch salesperson:", error);
        }
        setSalesperson(null);
        return;
      }

      setSalesperson(data ?? null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unexpected error fetching salesperson:", error);
      }
      setSalesperson(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(() => {
          void fetchSalesperson(nextSession.user.id);
        }, 0);
      } else {
        setSalesperson(null);
      }
    });

    // THEN check for existing session
    void supabase.auth
      .getSession()
      .then(({ data: { session: existingSession }, error }) => {
        if (!isMounted) return;

        if (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to get session:", error);
          }
          setSession(null);
          setUser(null);
          setSalesperson(null);
          return;
        }

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          void fetchSalesperson(existingSession.user.id);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSalesperson]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unexpected sign-in error:", error);
      }
      return { error: new Error("Falha inesperada ao entrar.") };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name },
        },
      });

      if (authError) {
        return { error: new Error(authError.message) };
      }

      if (authData.user) {
        const { data: existingSp, error: existingSpError } = await supabase
          .from("salespeople")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingSpError) {
          return { error: new Error(existingSpError.message) };
        }

        if (existingSp) {
          const { error: updateError } = await supabase
            .from("salespeople")
            .update({ auth_user_id: authData.user.id })
            .eq("id", existingSp.id);

          if (updateError) {
            return { error: new Error(updateError.message) };
          }
        } else {
          const { error: insertError } = await supabase.from("salespeople").insert({
            name,
            email,
            auth_user_id: authData.user.id,
            is_active: true,
            role: "hybrid",
          });

          if (insertError) {
            return { error: new Error(insertError.message) };
          }
        }
      }

      return { error: null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unexpected sign-up error:", error);
      }
      return { error: new Error("Falha inesperada ao criar a conta.") };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error && import.meta.env.DEV) {
      console.error("Sign-out error:", error);
    }

    setSalesperson(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, salesperson, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
