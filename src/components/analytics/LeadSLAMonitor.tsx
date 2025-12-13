import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLeadSLA, useLeadSLAStats, LeadSLAStatus } from "@/hooks/useLeadSLA";
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Phone,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function SLABadge({ status }: { status: "ok" | "warning" | "critical" }) {
  if (status === "critical") {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Crítico
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge variant="secondary" className="gap-1 bg-status-warning/20 text-status-warning border-status-warning/30">
        <AlertTriangle className="h-3 w-3" />
        Atenção
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-status-success/20 text-status-success border-status-success/30">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  );
}

function LeadCard({ lead }: { lead: LeadSLAStatus }) {
  const borderColor = {
    critical: "border-status-error/50 hover:border-status-error/70",
    warning: "border-status-warning/50 hover:border-status-warning/70",
    ok: "border-border/50 hover:border-primary/40",
  }[lead.sla_status];

  const bgColor = {
    critical: "bg-status-error/5",
    warning: "bg-status-warning/5",
    ok: "bg-card/50",
  }[lead.sla_status];

  return (
    <div className={`p-3 rounded-xl glass border ${borderColor} ${bgColor} transition-all duration-300 hover-lift cursor-pointer group animate-fade-in`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-medium text-sm truncate transition-colors group-hover:text-primary">{lead.client_name}</h4>
          <p className="text-xs text-muted-foreground truncate transition-colors group-hover:text-foreground/70">{lead.product_name}</p>
        </div>
        <SLABadge status={lead.sla_status} />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground/70">
            <Clock className="h-3 w-3" />
            <span>
              {lead.hours_since_contact}h sem contato
            </span>
          </div>
          {lead.salesperson && (
            <div className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground/70">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{lead.salesperson.name.split(" ")[0]}</span>
            </div>
          )}
        </div>
        <span className="font-display font-medium text-primary transition-transform duration-300 group-hover:scale-110">{formatCurrency(lead.amount)}</span>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Último contato: {lead.last_activity_at 
            ? formatDistanceToNow(new Date(lead.last_activity_at), { addSuffix: true, locale: ptBR })
            : "Nenhum"
          }
        </span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 transition-all duration-300 hover:scale-105">
          <Phone className="h-3 w-3" />
          Contatar
        </Button>
      </div>
    </div>
  );
}

export function LeadSLAMonitor() {
  const [warningHours, setWarningHours] = useState(4);
  const [criticalHours, setCriticalHours] = useState(8);
  const [showSettings, setShowSettings] = useState(false);
  
  const { data: leads, isLoading } = useLeadSLA({ warningHours, criticalHours });
  const stats = useLeadSLAStats({ warningHours, criticalHours });

  const criticalLeads = leads?.filter(l => l.sla_status === "critical") || [];
  const warningLeads = leads?.filter(l => l.sla_status === "warning") || [];

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 animate-pulse">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text">SLA de Resposta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full animate-shimmer" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow transition-all duration-300 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display group/title">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text">SLA de Resposta a Leads</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="gap-1 transition-all duration-300 hover:scale-105"
          >
            <Settings className="h-4 w-4" />
            {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings */}
        <Collapsible open={showSettings}>
          <CollapsibleContent className="space-y-3 pb-4 border-b border-border/50 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warning" className="text-xs font-display">Alerta (horas)</Label>
                <Input
                  id="warning"
                  type="number"
                  value={warningHours}
                  onChange={(e) => setWarningHours(Number(e.target.value))}
                  min={1}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="critical" className="text-xs font-display">Crítico (horas)</Label>
                <Input
                  id="critical"
                  type="number"
                  value={criticalHours}
                  onChange={(e) => setCriticalHours(Number(e.target.value))}
                  min={1}
                  className="h-8"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass border border-status-success/30 rounded-xl p-3 text-center transition-all duration-300 hover-lift cursor-pointer group animate-fade-in">
            <p className="text-2xl font-bold font-display text-status-success transition-transform duration-300 group-hover:scale-110">{stats.ok}</p>
            <p className="text-[10px] text-status-success/80 font-display">Dentro do SLA</p>
          </div>
          <div className="glass border border-status-warning/30 rounded-xl p-3 text-center transition-all duration-300 hover-lift cursor-pointer group animate-fade-in" style={{ animationDelay: '50ms' }}>
            <p className="text-2xl font-bold font-display text-status-warning transition-transform duration-300 group-hover:scale-110">{stats.warning}</p>
            <p className="text-[10px] text-status-warning/80 font-display">Atenção</p>
          </div>
          <div className="glass border border-status-error/30 rounded-xl p-3 text-center transition-all duration-300 hover-lift cursor-pointer group animate-fade-in" style={{ animationDelay: '100ms' }}>
            <p className="text-2xl font-bold font-display text-status-error transition-transform duration-300 group-hover:scale-110">{stats.critical}</p>
            <p className="text-[10px] text-status-error/80 font-display">Críticos</p>
          </div>
        </div>

        {/* Critical Leads */}
        {criticalLeads.length > 0 && (
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h4 className="text-xs font-display font-medium text-status-error flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
              Leads Críticos ({criticalLeads.length})
            </h4>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {criticalLeads.map((lead, index) => (
                  <div key={lead.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <LeadCard lead={lead} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Warning Leads */}
        {warningLeads.length > 0 && (
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h4 className="text-xs font-display font-medium text-status-warning flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Leads em Atenção ({warningLeads.length})
            </h4>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {warningLeads.map((lead, index) => (
                  <div key={lead.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <LeadCard lead={lead} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* All OK message */}
        {criticalLeads.length === 0 && warningLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-status-success glass rounded-xl border border-dashed border-status-success/30 animate-fade-in">
            <div className="p-3 rounded-full bg-status-success/20 shadow-lg shadow-status-success/20 mb-2">
              <CheckCircle className="h-10 w-10" />
            </div>
            <p className="text-sm font-display font-medium">Todos os leads dentro do SLA!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum lead aguardando contato há mais de {warningHours}h
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
