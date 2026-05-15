import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, UserCog, Lock, Bell, Wallet, ShieldCheck, Activity, LineChart } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface AdminQuickStatsProps {
  stats: {
    totalUsers: number;
    totalSalespeople: number;
    accessDeniedCount: number;
    securityAlertsCount: number;
    sdrAlertsCount: number;
    roleDistribution: { admin: number; manager: number; salesperson: number };
    totalRevenue: number;
    pendingApprovals: number;
  };
}

export function AdminQuickStats({ stats }: AdminQuickStatsProps) {
  const animatedSalespeople = useCountUp(stats.totalSalespeople);
  const animatedAccessDenied = useCountUp(stats.accessDeniedCount);
  const animatedRevenue = useCountUp(stats.totalRevenue);
  const animatedApprovals = useCountUp(stats.pendingApprovals);

  const formatBRL = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Revenue Card (Financial Focus) */}
      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Receita Mensal (Estimada)</p>
              <p className="text-3xl font-black gradient-text">{formatBRL(animatedRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <LineChart className="h-3 w-3 text-success" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Performance Global</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Operations Card */}
      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><UserCog className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Operação Ativa</p>
              <p className="text-3xl font-black text-chart-2">{animatedSalespeople}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold border-chart-2/30 text-chart-2 bg-chart-2/5">{stats.roleDistribution.salesperson} Vendedores</Badge>
                <Badge variant="outline" className="text-[9px] uppercase font-bold border-muted text-muted-foreground">{stats.totalUsers} Total</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 shadow-inner">
              <UserCog className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Approvals/Governance Card */}
      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pendências Comerciais</p>
              <p className={cn("text-3xl font-black", stats.pendingApprovals > 0 ? "text-warning" : "text-success")}>{animatedApprovals}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-tighter">
                {stats.pendingApprovals > 0 ? "Aguardando aprovação de metas/comissões" : "Processos comerciais em dia"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 shadow-inner">
              <ShieldCheck className="h-6 w-6 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Security/Alerts Card */}
      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Lock className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Segurança & Risco (7d)</p>
              <p className={cn("text-3xl font-black", animatedAccessDenied > 0 ? "text-destructive" : "text-muted-foreground")}>{animatedAccessDenied}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-destructive border-destructive/30 bg-destructive/5">{stats.securityAlertsCount} Alertas</Badge>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-warning border-warning/30 bg-warning/5">{stats.sdrAlertsCount} SDR</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-inner">
              <Activity className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
