import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Salesperson {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  commission_rate: number;
  notify_sales_in_app?: boolean;
  notify_sales_email?: boolean;
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
  const fetchedRef = useRef<string | null>(null);

  const fetchSalesperson = async (authUserId: string) => {
    // Prevent duplicate fetches for same user
    if (fetchedRef.current === authUserId) return;
    fetchedRef.current = authUserId;

    const { data, error } = await supabase
      .from("salespeople")
      .select("id, name, email, avatar_url, role, commission_rate, notify_sales_in_app, notify_sales_email")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!error && data) {
      setSalesperson(data);
    } else {
      fetchedRef.current = null; // Allow retry on error
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchSalesperson(session.user.id);
        } else {
          setSalesperson(null);
          fetchedRef.current = null;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSalesperson(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    if (authError) return { error: authError };

    // Link or create salesperson record
    if (authData.user) {
      // First try to find existing salesperson by email
      const { data: existingSp } = await supabase
        .from("salespeople")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existingSp) {
        // Link existing salesperson to auth user
        await supabase
          .from("salespeople")
          .update({ auth_user_id: authData.user.id })
          .eq("id", existingSp.id);
      } else {
        // Create new salesperson
        await supabase.from("salespeople").insert({
          name,
          email,
          auth_user_id: authData.user.id,
          is_active: true,
          role: "hybrid"
        });
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
