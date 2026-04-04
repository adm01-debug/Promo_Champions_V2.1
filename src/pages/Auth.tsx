import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormCard } from "@/components/auth/AuthFormCard";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(8, "Senha deve ter pelo menos 8 caracteres");
const nameSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres");

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
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
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(interval); if (loginEmail) checkLoginAttempts(loginEmail); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutStatus.isLocked, lockoutStatus.remainingSeconds, loginEmail, checkLoginAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(loginEmail); passwordSchema.parse(loginPassword); } catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    const { canAttempt } = await checkLoginAttempts(loginEmail);
    if (!canAttempt) { toast.error(`Conta temporariamente bloqueada. Aguarde ${formatRemainingTime(lockoutStatus.remainingSeconds)}.`); return; }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      await recordLoginAttempt(loginEmail, false, error.message);
      if (error.message.includes("Invalid login credentials")) {
        const attemptsLeft = MAX_ATTEMPTS - (lockoutStatus.attempts + 1);
        toast.error(attemptsLeft > 0 ? `Email ou senha incorretos. ${attemptsLeft} tentativa${attemptsLeft !== 1 ? "s" : ""} restante${attemptsLeft !== 1 ? "s" : ""}.` : "Email ou senha incorretos. Conta bloqueada temporariamente.");
      } else { toast.error(error.message); }
    } else { await recordLoginAttempt(loginEmail, true); toast.success("Bem-vindo de volta! 🚀"); navigate("/"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(signupEmail); passwordSchema.parse(signupPassword); nameSchema.parse(signupName); } catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    if (error) { toast.error(error.message.includes("already registered") ? "Este email já está cadastrado" : error.message); }
    else { toast.success("Conta criada com sucesso! Bem-vindo à equipe! 🎉"); navigate("/"); }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(resetEmail); } catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    setIsResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setIsResetLoading(false);
    if (error) toast.error("Erro ao enviar email de recuperação. Tente novamente.");
    else { toast.success("Email de recuperação enviado! Verifique sua caixa de entrada."); setResetDialogOpen(false); setResetEmail(""); }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try { const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (error) toast.error("Erro ao entrar com Google. Tente novamente."); }
    catch { toast.error("Erro ao conectar com Google."); }
    finally { setIsGoogleLoading(false); }
  };

  const isLoginDisabled = isLoading || (lockoutStatus.isLocked && countdown > 0);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      <AuthBrandPanel />
      <AuthFormCard
        loginEmail={loginEmail} setLoginEmail={setLoginEmail}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        signupEmail={signupEmail} setSignupEmail={setSignupEmail}
        signupPassword={signupPassword} setSignupPassword={setSignupPassword}
        signupName={signupName} setSignupName={setSignupName}
        resetEmail={resetEmail} setResetEmail={setResetEmail}
        resetDialogOpen={resetDialogOpen} setResetDialogOpen={setResetDialogOpen}
        isLoading={isLoading} isGoogleLoading={isGoogleLoading}
        isLoginDisabled={isLoginDisabled} isResetLoading={isResetLoading}
        lockoutStatus={lockoutStatus} countdown={countdown}
        MAX_ATTEMPTS={MAX_ATTEMPTS} formatRemainingTime={formatRemainingTime}
        handleLogin={handleLogin} handleSignup={handleSignup}
        handlePasswordReset={handlePasswordReset} handleGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
}
