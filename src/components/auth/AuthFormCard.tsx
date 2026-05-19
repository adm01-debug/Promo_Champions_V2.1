import React from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Sparkles, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AuthFormCardProps {
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  name: string;
  setName: (v: string) => void;
  showPwd: boolean;
  setShowPwd: (v: boolean) => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  resetEmail: string;
  setResetEmail: (v: string) => void;
  isResetLoading: boolean;
  resetDialogOpen: boolean;
  setResetDialogOpen: (v: boolean) => void;
  countdown: number;
  lockoutStatus: { isLocked: boolean };
  handleAuth: (e: React.FormEvent) => void;
  handlePasswordReset: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  isLoginDisabled: boolean;
}

export const AuthFormCard = React.memo(function AuthFormCard(props: AuthFormCardProps) {
  const {
    authMode, setAuthMode, name, setName, showPwd, setShowPwd, isLoading, isGoogleLoading,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword, resetEmail, setResetEmail,
    isResetLoading, resetDialogOpen, setResetDialogOpen, countdown, lockoutStatus,
    handleAuth, handlePasswordReset, handleGoogleSignIn, isLoginDisabled
  } = props;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="relative w-full lg:max-w-[74%] lg:ml-auto"
    >
      {/* Mobile brand */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-lg font-black tracking-wider">PROMO CHAMPIONS</h1>
      </div>

      <div className="relative">
        <motion.div
          className="absolute -inset-[1px] rounded-2xl opacity-60"
          style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7, #ec4899, #22d3ee)", backgroundSize: "300% 300%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        />

        <div className="relative rounded-2xl bg-[#0a0b1a]/95 backdrop-blur-xl p-7 sm:p-9 border border-white/5">
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
              <span className="text-[10px] tracking-[0.3em] text-cyan-300 font-bold">{authMode === 'login' ? 'ACESSO AO CIRCUITO' : 'CADASTRO NO CIRCUITO'}</span>
            </div>
            <h2 className="text-3xl font-black">{authMode === 'login' ? 'Pronto para vencer?' : 'Comece sua jornada'}</h2>
            <p className="text-sm text-white/50 mt-1">{authMode === 'login' ? 'Entre e suba no ranking agora.' : 'Crie seu perfil de elite.'}</p>
          </div>

          <div className="mb-6 p-3 rounded-xl bg-cyan-500/5 border border-cyan-400/20 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
            <p className="text-[11px] text-white/60 leading-relaxed">
              {authMode === 'login' ? (
                <>Novo no circuito? <button onClick={() => setAuthMode('signup')} className="text-cyan-300 font-bold hover:underline">Crie sua conta</button></>
              ) : (
                <>Já tem uma conta? <button onClick={() => setAuthMode('login')} className="text-cyan-300 font-bold hover:underline">Faça login</button></>
              )}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-11 mb-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            variant="outline"
          >
            {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0a0b1a] px-3 text-white/30">ou via credenciais</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[11px] font-bold text-white/40 ml-1 uppercase tracking-wider">Nome de Guerra</Label>
                <Input
                  id="name" type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 transition-all rounded-xl"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-bold text-white/40 ml-1 uppercase tracking-wider">E-mail de Acesso</Label>
              <Input
                id="email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 transition-all rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Senha de Acesso</Label>
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-[10px] font-bold text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase tracking-widest">Esqueci a chave</button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a0b1a] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black italic">RECUPERAR ACESSO</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4 pt-4">
                      <Input
                        placeholder="Email cadastrado" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                        className="bg-white/5 border-white/10" required
                      />
                      <Button type="submit" disabled={isResetLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#05060f] font-black uppercase tracking-widest">
                        {isResetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar Resgate"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative group/field">
                <Input
                  id="password" type={showPwd ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 transition-all rounded-xl pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoginDisabled}
              className="relative w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black uppercase tracking-[0.2em] rounded-xl overflow-hidden group/btn shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <motion.div
                className="absolute inset-0 bg-white/10 translate-x-[-100%]"
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {authMode === 'login' ? 'ACESSAR CIRCUITO' : 'INICIAR JORNADA'}
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </Button>
          </form>

          {lockoutStatus.isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold text-center uppercase tracking-widest"
            >
              SISTEMA BLOQUEADO · AGUARDE {countdown}S
            </motion.div>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
        © 2026 PROMO CHAMPIONS · ALL SYSTEMS NOMINAL
      </p>
    </motion.div>
  );
});
