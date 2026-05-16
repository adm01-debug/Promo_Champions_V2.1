import { Helmet } from "react-helmet-async";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Zap, Trophy, Target, Flame, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(8, "Senha deve ter pelo menos 8 caracteres");

export default function Auth() {
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { signIn, user } = useAuth();
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
        setCountdown((p) => { if (p <= 1) { clearInterval(i); if (loginEmail) checkLoginAttempts(loginEmail); return 0; } return p - 1; });
      }, 1000);
      return () => clearInterval(i);
    }
  }, [lockoutStatus.isLocked, lockoutStatus.remainingSeconds, loginEmail, checkLoginAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(loginEmail); passwordSchema.parse(loginPassword); }
    catch (err) { if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; } }
    const { canAttempt } = await checkLoginAttempts(loginEmail);
    if (!canAttempt) { toast.error(`Conta bloqueada. Aguarde ${formatRemainingTime(lockoutStatus.remainingSeconds)}.`); return; }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      await recordLoginAttempt(loginEmail, false, error.message);
      if (error.message.includes("Invalid login credentials")) {
        const left = MAX_ATTEMPTS - (lockoutStatus.attempts + 1);
        toast.error(left > 0 ? `Credenciais inválidas. ${left} tentativa${left !== 1 ? "s" : ""} restante${left !== 1 ? "s" : ""}.` : "Credenciais inválidas. Conta bloqueada.");
      } else toast.error(error.message);
    } else { await recordLoginAttempt(loginEmail, true); toast.success("Bem-vindo de volta, campeão! 🏆"); navigate("/"); }
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
    try { const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (error) toast.error("Erro Google."); }
    catch { toast.error("Erro Google."); }
    finally { setIsGoogleLoading(false); }
  };

  const isLoginDisabled = isLoading || (lockoutStatus.isLocked && countdown > 0);

  const particles = useMemo(() => Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    hue: Math.random() > 0.5 ? "#22d3ee" : Math.random() > 0.5 ? "#a855f7" : "#ec4899",
  })), []);

  return (
    <>
      <Helmet>
        <title>Arena de Login | Promo Champions</title>
        <meta name="description" content="Entre na Arena. Compete. Vença." />
      </Helmet>

      <div className="min-h-screen w-full relative overflow-hidden bg-[#05060f] text-white flex items-center justify-center p-4 sm:p-8">
        {/* Background neon grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }} />

        {/* Animated orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }}
          animate={{ scale: [1, 1.2], x: [0, 60], y: [0, 40] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
          animate={{ scale: [1.1, 1], x: [0, -50], y: [0, -30] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-30"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
          animate={{ scale: [1, 1.3] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.hue,
              boxShadow: `0 0 ${p.size * 4}px ${p.hue}`,
            }}
            animate={{ y: [0, -80], opacity: [0, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, repeatType: "reverse", delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 3px)"
        }} />

        {/* Main container */}
        <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
          {/* LEFT — Brand / Hype */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-8 p-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="relative p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600"
                animate={{ boxShadow: ["0 0 20px #22d3ee", "0 0 40px #a855f7"] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                <Crown className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-black tracking-wider" style={{ textShadow: "0 0 12px rgba(34,211,238,0.6)" }}>
                  PROMO CHAMPIONS
                </h1>
                <p className="text-[10px] tracking-[0.3em] text-cyan-300/70 font-semibold">ARENA DE VENDAS · ELITE</p>
              </div>
            </div>

            <div className="space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl xl:text-6xl font-black leading-[1.05]"
              >
                Entre na{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 24px rgba(168,85,247,0.4))" }}>
                  Arena
                </span>
                .<br />
                Domine o{" "}
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  pódio
                </span>
                .
              </motion.h2>

              <p className="text-lg text-white/60 max-w-md leading-relaxed">
                Onde vendedores viram <span className="text-cyan-300 font-semibold">lendas</span>.
                Gamificação real, ranking ao vivo e XP em cada deal fechado.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, label: "TOP CLOSERS", value: "2.8k", color: "#22d3ee" },
                { icon: Flame, label: "DEALS HOJE", value: "+47", color: "#ec4899" },
                { icon: Target, label: "CONVERSÃO", value: "+34%", color: "#a855f7" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="relative p-4 rounded-xl border bg-white/[0.02] backdrop-blur-sm overflow-hidden group"
                  style={{ borderColor: `${s.color}40` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at top, ${s.color}20, transparent 70%)` }} />
                  <s.icon className="h-4 w-4 mb-2" style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }} />
                  <div className="text-2xl font-black" style={{ color: s.color, textShadow: `0 0 12px ${s.color}80` }}>
                    {s.value}
                  </div>
                  <div className="text-[9px] tracking-[0.2em] text-white/40 font-semibold mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Tier badges */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: "LENDA", color: "#fbbf24" },
                { label: "ELITE", color: "#22d3ee" },
                { label: "VETERANO", color: "#fb923c" },
              ].map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `radial-gradient(circle, ${t.color}, ${t.color}40)`, boxShadow: `0 0 16px ${t.color}80` }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: t.color }}>{t.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative"
          >
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-black tracking-wider">PROMO CHAMPIONS</h1>
            </div>

            <div className="relative">
              {/* Animated border glow */}
              <motion.div
                className="absolute -inset-[1px] rounded-2xl opacity-60"
                style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7, #ec4899, #22d3ee)", backgroundSize: "300% 300%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative rounded-2xl bg-[#0a0b1a]/95 backdrop-blur-xl p-7 sm:p-9 border border-white/5">
                {/* Header */}
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-cyan-400" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
                    <span className="text-[10px] tracking-[0.3em] text-cyan-300 font-bold">ACESSO À ARENA</span>
                  </div>
                  <h2 className="text-3xl font-black">Pronto para vencer?</h2>
                  <p className="text-sm text-white/50 mt-1">Entre e suba no ranking agora.</p>
                </div>

                {/* Restricted access notice */}
                <div className="mb-6 p-3 rounded-xl bg-cyan-500/5 border border-cyan-400/20 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Sistema de uso <span className="text-cyan-300 font-bold">exclusivo</span> da Promo Brindes. Acesso liberado apenas pelo administrador.
                  </p>
                </div>

                {/* Google */}
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

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-bold text-white/40 ml-1 uppercase tracking-wider">Email de Combate</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 transition-all rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Criptografia</Label>
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
                              placeholder="Email cadastrado"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="bg-white/5 border-white/10"
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
                        id="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 transition-all rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                      >
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
                          INVASÃO DE SISTEMA
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
        </div>
      </div>
    </>
  );
}

interface NeonFieldProps {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoComplete?: string; suffix?: React.ReactNode;
}
function NeonField({ label, id, value, onChange, type = "text", placeholder, autoComplete, suffix }: NeonFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10px] tracking-[0.2em] text-white/60 font-bold">{label.toUpperCase()}</Label>
      <div className="relative group">
        <Input
          id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/25 pr-10 focus-visible:border-cyan-400/60 focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all"
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  );
}

function NeonSubmit({ disabled, loading, label }: { disabled: boolean; loading: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className="relative w-full h-12 rounded-md overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: "0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(168,85,247,0.4)" }} />
      <div className="relative h-full flex items-center justify-center gap-2 text-white font-black tracking-[0.15em] text-sm">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            {label}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </div>
    </motion.button>
  );
}
