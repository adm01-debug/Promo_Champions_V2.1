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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass border-border/40 hover-lift">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Usuários Totais</p>
              <p className="text-metric-lg gradient-text">{stats.totalUsers}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{stats.roleDistribution.admin} admin</Badge>
                <Badge variant="outline" className="text-xs">{stats.roleDistribution.manager} manager</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
              <p className="text-metric-lg gradient-text">{stats.totalSalespeople}</p>
              <p className="text-xs text-muted-foreground mt-2">Contas de vendedores ativos</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5">
              <UserCog className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Acessos Negados (7d)</p>
              <p className="text-metric-lg text-destructive">{stats.accessDeniedCount}</p>
              <p className="text-xs text-muted-foreground mt-2">Tentativas de acesso bloqueadas</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 hover-lift">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alertas Enviados (7d)</p>
              <p className="text-metric-lg text-warning">
                {stats.securityAlertsCount + stats.sdrAlertsCount}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs text-destructive">{stats.securityAlertsCount} segurança</Badge>
                <Badge variant="outline" className="text-xs text-warning">{stats.sdrAlertsCount} SDR</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5">
              <Bell className="h-6 w-6 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
