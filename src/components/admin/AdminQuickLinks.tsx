import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Activity, FileText, Bell, Database, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeadLettersCounts } from "@/hooks/win-loss/useDeadLettersCounts";

const QUICK_LINKS = [
  { to: "/configuracoes", icon: Settings, label: "Configurações", color: "text-muted-foreground" },
  { to: "/vendedores", icon: Users, label: "Vendedores", color: "text-chart-1" },
  { to: "/times", icon: Activity, label: "Atribuições SDR", color: "text-chart-2" },
  { to: "/portfolio", icon: FileText, label: "Portfólio", color: "text-chart-3" },
  { to: "/notificacoes", icon: Bell, label: "Notificações", color: "text-warning" },
  { to: "/bitrix24", icon: Database, label: "Bitrix24", color: "text-chart-4" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", color: "text-chart-5" },
  { to: "/metas", icon: TrendingUp, label: "Metas", color: "text-primary" },
  { to: "/playbooks", icon: FileText, label: "Playbooks", color: "text-chart-1" },
  { to: "/fonte-leads", icon: TrendingUp, label: "Fonte Leads", color: "text-chart-2" },
  { to: "/relatorio-atividades", icon: BarChart3, label: "Rel. Atividades", color: "text-chart-3" },
  { to: "/icp", icon: TrendingUp, label: "ICP", color: "text-chart-4" },
  { to: "/admin/webhooks-timeline", icon: Activity, label: "Timeline Webhooks", color: "text-chart-5" },
];

export function AdminQuickLinks() {
  const { data: counts } = useDeadLettersCounts();
  const pending = counts?.pending ?? 0;

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Acesso Rápido
        </CardTitle>
        <CardDescription>Links para áreas administrativas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => (
            <Button key={link.to} asChild variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted/50">
              <Link to={link.to}>
                <link.icon className={`h-5 w-5 ${link.color}`} />
                <span className="text-xs">{link.label}</span>
              </Link>
            </Button>
          ))}
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-muted/50 relative"
          >
            <Link to="/admin/webhooks-dead-letters" aria-label={`Dead-Letters de Webhooks${pending > 0 ? ` (${pending} pendentes)` : ""}`}>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="text-xs">Dead-Letters</span>
              {pending > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 text-[10px] h-5 min-w-[20px] px-1 flex items-center justify-center"
                >
                  {pending > 99 ? "99+" : pending}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
