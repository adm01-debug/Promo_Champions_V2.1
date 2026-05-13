import { Bell, AlertTriangle, Info, History as HistoryIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Alert {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  created_at: string;
  metadata?: {
    threshold?: number;
  };
}

interface AlertHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alertHistory: Alert[];
  clearAlertHistory: () => void;
  alertFrequency: string;
  testAlert: () => void;
}

export const AlertHistoryDialog = ({
  isOpen,
  onOpenChange,
  alertHistory,
  clearAlertHistory,
  alertFrequency,
  testAlert
}: AlertHistoryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <HistoryIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold font-mono uppercase tracking-widest text-primary">Histórico de Alertas</DialogTitle>
              <DialogDescription className="text-[10px] font-mono uppercase text-muted-foreground">Logs de Telemetria & Thresholds</DialogDescription>
            </div>
          </div>
          {alertHistory.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[9px] font-mono uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
              onClick={clearAlertHistory}
            >
              Limpar Logs
            </Button>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="p-4 space-y-4">
            {alertHistory.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-muted/20 border border-muted/30">
                    <Bell className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                </div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Nenhum alerta registrado</p>
              </div>
            ) : (
              alertHistory.map((alert) => (
                <div key={alert.id} className="relative group">
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-1 p-1.5 rounded-md border shrink-0",
                      alert.priority === 'high' ? "bg-destructive/10 border-destructive/30 text-destructive" :
                      alert.priority === 'medium' ? "bg-warning/10 border-warning/30 text-warning" :
                      "bg-primary/10 border-primary/30 text-primary"
                    )}>
                      {alert.priority === 'high' ? <AlertTriangle className="h-3 w-3" /> :
                       alert.priority === 'medium' ? <AlertTriangle className="h-3 w-3" /> :
                       <Info className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="text-[11px] font-bold font-mono uppercase text-foreground leading-none truncate">{alert.title}</h4>
                        <span className="text-[8px] font-mono text-muted-foreground whitespace-nowrap">
                          {format(new Date(alert.created_at), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-4 px-1 text-[7px] font-mono uppercase bg-background/40 border-border/40">
                          {alert.type}
                        </Badge>
                        {alert.metadata?.threshold && (
                          <Badge variant="outline" className="h-4 px-1 text-[7px] font-mono uppercase text-primary border-primary/30">
                            Goal: {alert.metadata.threshold}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -left-1 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
          <span className="text-[8px] font-mono uppercase text-muted-foreground">Config: {alertFrequency}</span>
          <Button variant="ghost" size="sm" className="h-6 text-[8px] uppercase font-bold text-primary hover:bg-primary/10" onClick={testAlert}>
            Forçar Check
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
