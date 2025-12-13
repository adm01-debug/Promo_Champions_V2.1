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
      <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
        <AlertTriangle className="h-3 w-3" />
        Atenção
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  );
}

function LeadCard({ lead }: { lead: LeadSLAStatus }) {
  const borderColor = {
    critical: "border-red-500/50",
    warning: "border-amber-500/50",
    ok: "border-border/50",
  }[lead.sla_status];

  const bgColor = {
    critical: "bg-red-500/5",
    warning: "bg-amber-500/5",
    ok: "bg-card/50",
  }[lead.sla_status];

  return (
    <div className={`p-3 rounded-lg border ${borderColor} ${bgColor} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm truncate">{lead.client_name}</h4>
          <p className="text-xs text-muted-foreground truncate">{lead.product_name}</p>
        </div>
        <SLABadge status={lead.sla_status} />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {lead.hours_since_contact}h sem contato
            </span>
          </div>
          {lead.salesperson && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{lead.salesperson.name.split(" ")[0]}</span>
            </div>
          )}
        </div>
        <span className="font-medium text-primary">{formatCurrency(lead.amount)}</span>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Último contato: {lead.last_activity_at 
            ? formatDistanceToNow(new Date(lead.last_activity_at), { addSuffix: true, locale: ptBR })
            : "Nenhum"
          }
        </span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1">
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
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            SLA de Resposta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            SLA de Resposta a Leads
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="gap-1"
          >
            <Settings className="h-4 w-4" />
            {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings */}
        <Collapsible open={showSettings}>
          <CollapsibleContent className="space-y-3 pb-4 border-b border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warning" className="text-xs">Alerta (horas)</Label>
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
                <Label htmlFor="critical" className="text-xs">Crítico (horas)</Label>
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
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.ok}</p>
            <p className="text-[10px] text-emerald-400/80">Dentro do SLA</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.warning}</p>
            <p className="text-[10px] text-amber-400/80">Atenção</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-[10px] text-red-400/80">Críticos</p>
          </div>
        </div>

        {/* Critical Leads */}
        {criticalLeads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Leads Críticos ({criticalLeads.length})
            </h4>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {criticalLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Warning Leads */}
        {warningLeads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Leads em Atenção ({warningLeads.length})
            </h4>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {warningLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* All OK message */}
        {criticalLeads.length === 0 && warningLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-emerald-400">
            <CheckCircle className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">Todos os leads dentro do SLA!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum lead aguardando contato há mais de {warningHours}h
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
