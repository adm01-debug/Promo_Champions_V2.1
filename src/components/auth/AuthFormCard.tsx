import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ShieldAlert, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface AuthFormCardProps {
  loginEmail: string; setLoginEmail: (v: string) => void;
  loginPassword: string; setLoginPassword: (v: string) => void;
  signupEmail: string; setSignupEmail: (v: string) => void;
  signupPassword: string; setSignupPassword: (v: string) => void;
  signupName: string; setSignupName: (v: string) => void;
  resetEmail: string; setResetEmail: (v: string) => void;
  resetDialogOpen: boolean; setResetDialogOpen: (v: boolean) => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLoginDisabled: boolean;
  isResetLoading: boolean;
  lockoutStatus: { isLocked: boolean; attempts: number };
  countdown: number;
  MAX_ATTEMPTS: number;
  formatRemainingTime: (s: number) => string;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  handlePasswordReset: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
}

export function AuthFormCard(props: AuthFormCardProps) {
  const {
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    signupEmail, setSignupEmail, signupPassword, setSignupPassword,
    signupName, setSignupName, resetEmail, setResetEmail,
    resetDialogOpen, setResetDialogOpen,
    isLoading, isGoogleLoading, isLoginDisabled, isResetLoading,
    lockoutStatus, countdown, MAX_ATTEMPTS, formatRemainingTime,
    handleLogin, handleSignup, handlePasswordReset, handleGoogleSignIn,
  } = props;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Mobile branding */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 lg:hidden">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display gradient-text">PROMO CHAMPIONS</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre no circuito e conquiste seu lugar</p>
        </motion.div>

        {/* Desktop heading */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hidden lg:block mb-8">
          <h2 className="text-metric">Bem-vindo de volta</h2>
          <p className="text-muted-foreground mt-1">Faça login ou crie sua conta para competir</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Card className="border-border/40 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-muted/50">
                  <TabsTrigger value="login" className="rounded-lg font-medium data-[state=active]:shadow-sm">Entrar</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg font-medium data-[state=active]:shadow-sm">Cadastrar</TabsTrigger>
                </TabsList>

                {/* Google */}
                <Button type="button" variant="outline" className="w-full mb-4 gap-2.5 h-11 rounded-xl border-border/60 hover:bg-muted/50 font-medium" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                  {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
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
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground/60 text-[11px]">ou com email</span></div>
                </div>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {lockoutStatus.isLocked && countdown > 0 && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-xl">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertDescription className="text-sm">Conta bloqueada por múltiplas tentativas falhadas. Aguarde <span className="font-bold">{formatRemainingTime(countdown)}</span> para tentar novamente.</AlertDescription>
                      </Alert>
                    )}
                    {!lockoutStatus.isLocked && lockoutStatus.attempts > 0 && lockoutStatus.attempts < MAX_ATTEMPTS && (
                      <Alert className="border-warning/50 bg-warning/10 rounded-xl">
                        <ShieldAlert className="h-4 w-4 text-warning" />
                        <AlertDescription className="text-sm text-warning">{MAX_ATTEMPTS - lockoutStatus.attempts} tentativa{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? "s" : ""} restante{MAX_ATTEMPTS - lockoutStatus.attempts !== 1 ? "s" : ""} antes do bloqueio.</AlertDescription>
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
                        <Button type="button" variant="link" className="px-0 h-auto font-normal text-muted-foreground hover:text-primary text-sm">Esqueci minha senha</Button>
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
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Acessando...</>) : lockoutStatus.isLocked && countdown > 0 ? (<><ShieldAlert className="mr-2 h-4 w-4" />Bloqueado ({formatRemainingTime(countdown)})</>) : "Entrar no Circuito"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
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

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-xs text-muted-foreground/50 mt-6">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </motion.p>
      </div>
    </div>
  );
}
