import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Crown, Swords, Trophy, Loader2, Mail, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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
  
  const { 
    lockoutStatus, 
    checkLoginAttempts, 
    recordLoginAttempt, 
    formatRemainingTime,
    MAX_ATTEMPTS 
  } = useLoginRateLimiter();

  // Contador regressivo para o bloqueio
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Verificar status de bloqueio quando o email muda
  useEffect(() => {
    if (loginEmail && emailSchema.safeParse(loginEmail).success) {
      checkLoginAttempts(loginEmail);
    }
  }, [loginEmail, checkLoginAttempts]);

  // Atualizar countdown
  useEffect(() => {
    if (lockoutStatus.isLocked && lockoutStatus.remainingSeconds > 0) {
      setCountdown(lockoutStatus.remainingSeconds);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Verificar novamente após o countdown
            if (loginEmail) {
              checkLoginAttempts(loginEmail);
            }
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
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    // Verificar bloqueio antes de tentar login
    const { canAttempt } = await checkLoginAttempts(loginEmail);
    if (!canAttempt) {
      toast.error(`Conta temporariamente bloqueada. Aguarde ${formatRemainingTime(lockoutStatus.remainingSeconds)}.`);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      // Registrar tentativa falhada
      await recordLoginAttempt(loginEmail, false, error.message);
      
      if (error.message.includes("Invalid login credentials")) {
        const attemptsLeft = MAX_ATTEMPTS - (lockoutStatus.attempts + 1);
        if (attemptsLeft > 0) {
          toast.error(`Email ou senha incorretos. ${attemptsLeft} tentativa${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''}.`);
        } else {
          toast.error("Email ou senha incorretos. Conta bloqueada temporariamente.");
        }
      } else {
        toast.error(error.message);
      }
    } else {
      // Registrar tentativa bem-sucedida
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
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Conta criada com sucesso! Bem-vindo à equipe! 🎉");
      navigate("/");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(resetEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsResetLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setIsResetLoading(false);

    if (error) {
      toast.error("Erro ao enviar email de recuperação. Tente novamente.");
    } else {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setResetDialogOpen(false);
      setResetEmail("");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Erro ao entrar com Google. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao conectar com Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoginDisabled = isLoading || (lockoutStatus.isLocked && countdown > 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[100px]" />
      </div>
      <div className="w-full max-w-md">
        {/* Títulos animados */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center gap-4 mb-4">
            <div className="flex flex-col items-center gap-1 opacity-0 animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-background">
                <Crown className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Lenda</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-background">
                <Swords className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Elite</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-background">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Veterano</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            PROMO CHAMPIONS
          </h1>
          <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            Entre na arena e conquiste seu lugar no ranking
          </p>
        </div>

        <Card className="glass border-border/30 shadow-2xl shadow-primary/5 opacity-0 animate-scale-in backdrop-blur-xl" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
          <CardHeader className="text-center">
            <CardTitle>Acesso</CardTitle>
            <CardDescription>
              Faça login ou crie sua conta para competir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Google Sign-In */}
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 gap-2 h-11"
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
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Alerta de bloqueio */}
                  {lockoutStatus.isLocked && countdown > 0 && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Conta bloqueada por múltiplas tentativas falhadas. 
                        Aguarde <span className="font-bold">{formatRemainingTime(countdown)}</span> para tentar novamente.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Aviso de tentativas restantes */}
                  {!lockoutStatus.isLocked && lockoutStatus.attempts > 0 && lockoutStatus.attempts < MAX_ATTEMPTS && (
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                      <ShieldAlert className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-sm text-amber-600">
                        {MAX_ATTEMPTS - lockoutStatus.attempts} tentativa{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? 's' : ''} antes do bloqueio.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoginDisabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <PasswordInput
                      id="login-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoginDisabled}
                    />
                  </div>
                  
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 h-auto font-normal text-muted-foreground hover:text-primary"
                      >
                        Esqueci minha senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Recuperar Senha
                        </DialogTitle>
                        <DialogDescription>
                          Digite seu email para receber um link de recuperação de senha.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isResetLoading}>
                          {isResetLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar Link de Recuperação"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button type="submit" className="w-full gradient-primary" disabled={isLoginDisabled}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : lockoutStatus.isLocked && countdown > 0 ? (
                      <>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Bloqueado ({formatRemainingTime(countdown)})
                      </>
                    ) : (
                      "Entrar na Arena"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Seu Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Como você quer ser chamado"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="Crie uma senha forte"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <PasswordStrength password={signupPassword} />
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta e Competir"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
