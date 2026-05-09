import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, Lock, Bell } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface AdminQuickStatsProps {
  stats: {
    totalUsers: number;
    totalSalespeople: number;
    accessDeniedCount: number;
    securityAlertsCount: number;
    sdrAlertsCount: number;
    roleDistribution: { admin: number; manager: number; salesperson: number };
  };
}

export function AdminQuickStats({ stats }: AdminQuickStatsProps) {
  const animatedUsers = useCountUp(stats.totalUsers);
  const animatedSalespeople = useCountUp(stats.totalSalespeople);
  const animatedAccessDenied = useCountUp(stats.accessDeniedCount);
  const animatedAlerts = useCountUp(stats.securityAlertsCount + stats.sdrAlertsCount);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Usuários Totais</p>
              <p className="text-4xl font-black gradient-text">{animatedUsers}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold">{stats.roleDistribution.admin} admin</Badge>
                <Badge variant="outline" className="text-[10px] uppercase font-bold">{stats.roleDistribution.manager} manager</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><UserCog className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vendedores Ativos</p>
              <p className="text-4xl font-black text-chart-2">{animatedSalespeople}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-tighter">Contas operacionais ativas</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 shadow-inner">
              <UserCog className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Lock className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Acessos Negados (7d)</p>
              <p className="text-4xl font-black text-destructive">{animatedAccessDenied}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-tighter">Tentativas de intrusão bloqueadas</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-inner">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Bell className="h-12 w-12" /></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alertas de Risco (7d)</p>
              <p className="text-4xl font-black text-warning">
                {animatedAlerts}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-destructive border-destructive/30">{stats.securityAlertsCount} segurança</Badge>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-warning border-warning/30">{stats.sdrAlertsCount} SDR</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 shadow-inner">
              <Bell className="h-6 w-6 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
