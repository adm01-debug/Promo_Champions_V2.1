import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PriceAlertsPanelProps {
  alerts: any[];
  unreadCount: number;
  onMarkAllRead: () => void;
  formatCurrency: (value: number) => string;
}

export const PriceAlertsPanel = React.memo(function PriceAlertsPanel({
  alerts,
  unreadCount,
  onMarkAllRead,
  formatCurrency,
}: PriceAlertsPanelProps) {
  return (
    <Card className="glass border-status-warning/30 bg-status-warning/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-status-warning" />
            Alertas de Preço
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Marcar todos como lidos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${alert.is_read ? "bg-muted/30" : "bg-background"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.alert_type === "price_drop" ? (
                      <TrendingDown className="h-4 w-4 text-status-success" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-medium">{alert.products?.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{alert.suppliers?.name}</span>
                  </div>
                  <Badge variant={alert.alert_type === "price_drop" ? "default" : "destructive"}>
                    {alert.price_change_percent?.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {alert.old_price && formatCurrency(alert.old_price)} → {formatCurrency(alert.new_price)}
                  <span className="ml-2">•</span>
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum alerta de preço. Alertas são criados automaticamente quando preços variam mais de 5%.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
