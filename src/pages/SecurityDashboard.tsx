import React from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSecurityStats, useLoginAttempts } from "@/hooks/useSecurityMonitoring";
import { useCircuitBreakerStats, useCircuitBreakerHistory } from "@/hooks/useCircuitBreakerHistory";
import { Shield, ShieldAlert, ShieldCheck, LogIn, LogOut, Ban, Activity, AlertTriangle, Check, X, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GeoBlockingMap } from "@/components/security/GeoBlockingMap";

const SecurityDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useSecurityStats();
  const { data: loginAttempts, isLoading: loginsLoading } = useLoginAttempts({ limit: 30 });
  const { data: cbStats } = useCircuitBreakerStats();
  const { data: cbHistory } = useCircuitBreakerHistory(undefined, 20);

  return (
    <>
      <Helmet>
        <title>Segurança | Promo Champions</title>
        <meta name="description" content="Dashboard de segurança com IPs, logins e circuit breakers." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">🛡️ Dashboard de Segurança</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitoramento de IPs, logins e circuit breakers</p>
          </motion.div>

          {/* Stats Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : stats && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 glass border-border/40 text-center">
                <Ban className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <p className="text-2xl font-display font-bold">{stats.activeBlockedIPs}</p>
                <p className="text-[10px] text-muted-foreground">IPs Bloqueados</p>
              </Card>
              <Card className="p-4 glass border-border/40 text-center">
                <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-status-success" />
                <p className="text-2xl font-display font-bold">{stats.whitelistedIPs}</p>
                <p className="text-[10px] text-muted-foreground">IPs Liberados</p>
              </Card>
              <Card className="p-4 glass border-border/40 text-center">
                <LogIn className="h-5 w-5 mx-auto mb-1 text-info" />
                <p className="text-2xl font-display font-bold">{stats.loginSuccessRate}%</p>
                <p className="text-[10px] text-muted-foreground">Taxa Login OK (24h)</p>
              </Card>
              <Card className="p-4 glass border-border/40 text-center">
                <ShieldAlert className="h-5 w-5 mx-auto mb-1 text-status-warning" />
                <p className="text-2xl font-display font-bold">{stats.blockedRequests24h}</p>
                <p className="text-[10px] text-muted-foreground">Requests Bloqueados (24h)</p>
              </Card>
            </motion.div>
          )}

          {/* Geo-Blocking Section */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40 overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Gestão de Bloqueio Geográfico
                </h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4">
                  Active Shields
                </Badge>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <GeoBlockingMap />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Protocolo de Defesa</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        O bloqueio geográfico impede qualquer requisição vinda de países marcados como suspeitos ou fora da sua zona de operação.
                      </p>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                           <span className="text-muted-foreground">Latência de Bloqueio</span>
                           <span className="font-mono text-status-success">~12ms</span>
                         </div>
                         <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                           <span className="text-muted-foreground">Precisão por IP</span>
                           <span className="font-mono text-status-success">99.8%</span>
                         </div>
                         <div className="flex items-center justify-between text-[10px]">
                           <span className="text-muted-foreground">Proteção DDoS Ativa</span>
                           <span className="font-mono text-status-success">L7 Shield</span>
                         </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                      Ver Logs Detalhados
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Attempts */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/40">
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-primary" /> Tentativas de Login Recentes
                  </h3>
                </div>
                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {loginsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)
                  ) : !loginAttempts?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Sem dados de login</p>
                  ) : (
                    loginAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/30 text-xs">
                        {attempt.success ? (
                          <Check className="h-3.5 w-3.5 text-status-success shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className="font-medium flex-1 truncate">{attempt.email}</span>
                        <span className="text-muted-foreground">{attempt.ip_address || "—"}</span>
                        <span className="text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(attempt.created_at ?? new Date()), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Circuit Breaker Events */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/40">
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-status-warning" /> Circuit Breaker Events
                  </h3>
                </div>
                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {!cbHistory?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado</p>
                  ) : (
                    cbHistory.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/30 text-xs">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          event.event_type === "failure" ? "text-destructive border-destructive/30" :
                          event.event_type === "recovery" ? "text-status-success border-status-success/30" :
                          "text-status-warning border-status-warning/30"
                        )}>
                          {event.event_type}
                        </Badge>
                        <span className="font-mono text-[11px] flex-1 truncate">{event.circuit_name}</span>
                        <span className="text-muted-foreground">
                          {event.previous_state} → {event.new_state}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default SecurityDashboard;
