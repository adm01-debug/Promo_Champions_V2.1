import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, AlertTriangle, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SDRDetail {
  id: string;
  name: string;
  consecutiveDays: number;
}

interface AlertHistoryItemProps {
  item: {
    id: string;
    created_at: string;
    triggered_by: string;
    sdrs_notified: number;
    threshold_used: number;
    sdr_details: SDRDetail[];
    admin_emails: string[];
  };
}

export const AlertHistoryItem = React.memo(function AlertHistoryItem({ item }: AlertHistoryItemProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
        <Badge variant={item.triggered_by === "manual" ? "secondary" : "outline"} className="text-xs">
          {item.triggered_by === "manual" ? "Manual" : "Automático"}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-destructive" />
          <span className="font-medium">{item.sdrs_notified}</span>
          <span className="text-muted-foreground">SDRs notificados</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />
          <span className="text-muted-foreground">Threshold: {item.threshold_used}d</span>
        </div>
      </div>

      {item.sdr_details?.length > 0 && (
        <div className="pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-1">SDRs afetados:</p>
          <div className="flex flex-wrap gap-1">
            {item.sdr_details.map((sdr) => (
              <Badge key={sdr.id} variant="destructive" className="text-xs gap-1">
                {sdr.name} ({sdr.consecutiveDays}d)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {item.admin_emails?.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          Enviado para: {item.admin_emails.slice(0, 2).join(", ")}
          {item.admin_emails.length > 2 && ` +${item.admin_emails.length - 2}`}
        </div>
      )}
    </div>
  );
});
