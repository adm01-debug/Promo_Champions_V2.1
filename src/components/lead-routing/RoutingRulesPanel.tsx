import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings2, Filter } from "lucide-react";
import {
  useRoutingRules,
  useToggleRoutingRule,
} from "@/hooks/useLeadRoutingEngine";
import { formatStrategy, strategyTone } from "./routingHelpers";

export function RoutingRulesPanel() {
  const { data: rules, isLoading } = useRoutingRules();
  const toggle = useToggleRoutingRule();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Settings2 className="h-4 w-4 text-primary" />
          Regras de Roteamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !rules || rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma regra configurada</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3 hover:bg-card transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{rule.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Prioridade {rule.priority}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${strategyTone(rule.strategy)}`}>
                    {formatStrategy(rule.strategy)}
                  </Badge>
                </div>
                {rule.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {rule.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {rule.filter_min_value && (
                    <span>Min: R$ {rule.filter_min_value.toLocaleString("pt-BR")}</span>
                  )}
                  {rule.filter_state && <span>UF: {rule.filter_state}</span>}
                  {rule.filter_source && <span>Origem: {rule.filter_source}</span>}
                </div>
              </div>
              <Switch
                checked={rule.is_active}
                onCheckedChange={(v) => toggle.mutate({ id: rule.id, is_active: v })}
                disabled={toggle.isPending}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
