import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Crown, Swords, Trophy, Loader2, Mail, ShieldAlert, Star, TrendingUp, Zap } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { motion } from "framer-motion";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(8, "Senha deve ter pelo menos 8 caracteres");
const nameSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres");

/* ─── Floating particle ─── */
function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: string; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-2xl pointer-events-none ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* ─── Stat badge ─── */
function StatBadge({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/10 backdrop-blur-md border border-primary-foreground/10"
    >
      <div className="p-2 rounded-xl bg-primary-foreground/10">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xl font-bold font-display text-primary-foreground">{value}</p>
        <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

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

  const {
    lockoutStatus,
    checkLoginAttempts,
    recordLoginAttempt,
    formatRemainingTime,
    MAX_ATTEMPTS,
  } = useLoginRateLimiter();

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (loginEmail && emailSchema.safeParse(loginEmail).success) {
      checkLoginAttempts(loginEmail);
    }
  }, [loginEmail, checkLoginAttempts]);

  useEffect(() => {
    if (lockoutStatus.isLocked && lockoutStatus.remainingSeconds > 0) {
      setCountdown(lockoutStatus.remainingSeconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (loginEmail) checkLoginAttempts(loginEmail);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutStatus.isLocked, lockoutStatus.remainingSeconds, loginEmail, checkLoginAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
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
    } else {
      await recordLoginAttempt(loginEmail, true);
      toast.success("Bem-vindo de volta! 🚀");
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      nameSchema.parse(signupName);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes("already registered") ? "Este email já está cadastrado" : error.message);
    } else {
      toast.success("Conta criada com sucesso! Bem-vindo à equipe! 🎉");
      navigate("/");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(resetEmail); } catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    setIsResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setIsResetLoading(false);
    if (error) { toast.error("Erro ao enviar email de recuperação. Tente novamente."); }
    else { toast.success("Email de recuperação enviado! Verifique sua caixa de entrada."); setResetDialogOpen(false); setResetEmail(""); }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) toast.error("Erro ao entrar com Google. Tente novamente.");
    } catch { toast.error("Erro ao conectar com Google."); }
    finally { setIsGoogleLoading(false); }
  };

  const isLoginDisabled = isLoading || (lockoutStatus.isLocked && countdown > 0);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      {/* ════════ LEFT PANEL — Brand Showcase ════════ */}
      <div className="relative hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary via-primary/90 to-primary-glow overflow-hidden">
        {/* Animated orbs */}
        <FloatingOrb delay={0} x="10%" y="15%" size="180px" color="bg-primary-foreground/5" />
        <FloatingOrb delay={2} x="70%" y="60%" size="220px" color="bg-accent/10" />
        <FloatingOrb delay={4} x="40%" y="80%" size="140px" color="bg-primary-foreground/8" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo & Brand */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
                <Crown className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-primary-foreground tracking-tight">
                  PROMO CHAMPIONS
                </h1>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.3em] font-medium">
                  Realize seus sonhos!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hero tagline */}
          <div className="flex-1 flex flex-col justify-center -mt-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl xl:text-5xl font-bold font-display text-primary-foreground leading-tight mb-4"
            >
              Transforme sua
              <br />
              equipe em{" "}
              <span className="relative">
                <span className="relative z-10">campeões</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-accent/30 -z-0 origin-left rounded"
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base text-primary-foreground/60 max-w-md leading-relaxed"
            >
              Gamificação inteligente, analytics avançado e IA para impulsionar o desempenho da sua equipe de vendas.
            </motion.p>

            {/* Stat badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              <StatBadge icon={TrendingUp} label="Aumento médio" value="+34%" delay={0.8} />
              <StatBadge icon={Star} label="Vendedores ativos" value="2.8k" delay={1} />
              <StatBadge icon={Zap} label="Deals fechados" value="45k+" delay={1.2} />
            </div>
          </div>

          {/* Rank badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex items-center gap-6"
          >
            {[
              { icon: Crown, label: "Lenda", gradient: "from-yellow-400 to-amber-500" },
              { icon: Swords, label: "Elite", gradient: "from-purple-400 to-violet-500" },
              { icon: Trophy, label: "Veterano", gradient: "from-amber-400 to-orange-500" },
            ].map((rank, i) => (
              <motion.div
                key={rank.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.15, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${rank.gradient} shadow-lg`}>
                  <rank.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-primary-foreground/50 uppercase tracking-wider">
                  {rank.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════ RIGHT PANEL — Auth Form ════════ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Subtle background for right panel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile-only branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 lg:hidden"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
                <Crown className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-display gradient-text">PROMO CHAMPIONS</h1>
            <p className="text-sm text-muted-foreground mt-1">Entre na arena e conquiste seu lugar</p>
          </motion.div>

          {/* Desktop right-panel heading */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block mb-8"
          >
            <h2 className="text-2xl font-bold font-display">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-1">Faça login ou crie sua conta para competir</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-border/40 shadow-xl shadow-primary/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-muted/50">
                    <TabsTrigger value="login" className="rounded-lg font-medium data-[state=active]:shadow-sm">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg font-medium data-[state=active]:shadow-sm">
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  {/* Google */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4 gap-2.5 h-11 rounded-xl border-border/60 hover:bg-muted/50 font-medium"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Continuar com Google
                  </Button>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground/60 text-[11px]">ou com email</span>
                    </div>
                  </div>

                  {/* ─── Login Tab ─── */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      {lockoutStatus.isLocked && countdown > 0 && (
                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-xl">
                          <ShieldAlert className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Conta bloqueada por múltiplas tentativas falhadas.
                            Aguarde <span className="font-bold">{formatRemainingTime(countdown)}</span> para tentar novamente.
                          </AlertDescription>
                        </Alert>
                      )}

                      {!lockoutStatus.isLocked && lockoutStatus.attempts > 0 && lockoutStatus.attempts < MAX_ATTEMPTS && (
                        <Alert className="border-warning/50 bg-warning/10 rounded-xl">
                          <ShieldAlert className="h-4 w-4 text-warning" />
                          <AlertDescription className="text-sm text-warning">
                            {MAX_ATTEMPTS - lockoutStatus.attempts} tentativa{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? "s" : ""} restante{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? "s" : ""} antes do bloqueio.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={isLoginDisabled} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <PasswordInput id="login-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isLoginDisabled} className="h-11 rounded-xl" />
                      </div>

                      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="link" className="px-0 h-auto font-normal text-muted-foreground hover:text-primary text-sm">
                            Esqueci minha senha
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Recuperar Senha</DialogTitle>
                            <DialogDescription>Digite seu email para receber um link de recuperação de senha.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email</Label>
                              <Input id="reset-email" type="email" placeholder="seu@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required className="h-11 rounded-xl" />
                            </div>
                            <Button type="submit" className="w-full h-11 rounded-xl" disabled={isResetLoading}>
                              {isResetLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>) : "Enviar Link de Recuperação"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Button type="submit" className="w-full h-11 rounded-xl gradient-primary font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={isLoginDisabled}>
                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>) : lockoutStatus.isLocked && countdown > 0 ? (<><ShieldAlert className="mr-2 h-4 w-4" />Bloqueado ({formatRemainingTime(countdown)})</>) : "Entrar na Arena"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* ─── Signup Tab ─── */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Seu Nome</Label>
                        <Input id="signup-name" type="text" placeholder="Como você quer ser chamado" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Senha</Label>
                        <PasswordInput id="signup-password" placeholder="Crie uma senha forte" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="h-11 rounded-xl" />
                        <PasswordStrength password={signupPassword} />
                      </div>
                      <Button type="submit" className="w-full h-11 rounded-xl gradient-primary font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={isLoading}>
                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</>) : "Criar Conta e Competir"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-muted-foreground/50 mt-6"
          >
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
