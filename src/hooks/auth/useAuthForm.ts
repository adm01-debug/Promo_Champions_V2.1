import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(8, "Senha deve ter pelo menos 8 caracteres");

export function useAuthForm() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { lockoutStatus, checkLoginAttempts, recordLoginAttempt, formatRemainingTime, MAX_ATTEMPTS } = useLoginRateLimiter();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  useEffect(() => {
    if (loginEmail && emailSchema.safeParse(loginEmail).success) checkLoginAttempts(loginEmail);
  }, [loginEmail, checkLoginAttempts]);

  useEffect(() => {
    if (lockoutStatus.isLocked && lockoutStatus.remainingSeconds > 0) {
      setCountdown(lockoutStatus.remainingSeconds);
      const i = setInterval(() => {
        setCountdown((p) => { 
          if (p <= 1) { 
            clearInterval(i); 
            if (loginEmail) checkLoginAttempts(loginEmail); 
            return 0; 
          } 
          return p - 1; 
        });
      }, 1000);
      return () => clearInterval(i);
    }
  }, [lockoutStatus.isLocked, lockoutStatus.remainingSeconds, loginEmail, checkLoginAttempts]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      emailSchema.parse(loginEmail); 
      passwordSchema.parse(loginPassword); 
      if (authMode === 'signup' && !name) {
        toast.error("Por favor, insira seu nome.");
        return;
      }
    }
    catch (err) { 
      if (err instanceof z.ZodError) { 
        toast.error(err.errors[0].message); 
        return; 
      } 
    }
    
    if (authMode === 'login') {
      const { canAttempt } = await checkLoginAttempts(loginEmail);
      if (!canAttempt) { 
        toast.error(`Conta bloqueada. Aguarde ${formatRemainingTime(lockoutStatus.remainingSeconds)}.`); 
        return; 
      }
      setIsLoading(true);
      const { error } = await signIn(loginEmail, loginPassword);
      setIsLoading(false);
      if (error) {
        await recordLoginAttempt(loginEmail, false, error.message);
        if (error.message.includes("Invalid login credentials")) {
          const left = MAX_ATTEMPTS - (lockoutStatus.attempts + 1);
          toast.error(left > 0 ? `Credenciais inválidas. ${left} tentativa${left !== 1 ? "s" : ""} restante${left !== 1 ? "s" : ""}.` : "Credenciais inválidas. Conta bloqueada.");
        } else toast.error(error.message);
      } else { 
        await recordLoginAttempt(loginEmail, true); 
        toast.success("Bem-vindo de volta, campeão! 🏆"); 
        navigate("/"); 
      }
    } else {
      setIsLoading(true);
      const { error } = await signUp(loginEmail, loginPassword, name);
      setIsLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada com sucesso! 🚀");
        setAuthMode('login');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(resetEmail); } catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    setIsResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setIsResetLoading(false);
    if (error) toast.error("Erro ao enviar recuperação.");
    else { toast.success("Email enviado!"); setResetDialogOpen(false); setResetEmail(""); }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try { 
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); 
      if (error) toast.error("Erro Google."); 
    }
    catch { 
      toast.error("Erro Google."); 
    }
    finally { 
      setIsGoogleLoading(false); 
    }
  };

  return {
    authMode, setAuthMode,
    name, setName,
    showPwd, setShowPwd,
    isLoading,
    isGoogleLoading,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    resetEmail, setResetEmail,
    isResetLoading,
    resetDialogOpen, setResetDialogOpen,
    countdown,
    lockoutStatus,
    handleAuth,
    handlePasswordReset,
    handleGoogleSignIn,
    isLoginDisabled: isLoading || (lockoutStatus.isLocked && countdown > 0)
  };
}
