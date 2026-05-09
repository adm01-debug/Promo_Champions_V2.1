import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, MessageCircle, AlertCircle, ShoppingCart, Repeat } from "lucide-react";

export type IntentType = "buying_signal" | "objection" | "comparison" | "technical" | "closing" | "followup";

export interface Intent {
  type: IntentType;
  label: string;
  confidence: number;
  timestamp_sec: number;
  excerpt: string;
}

interface Props {
  recordingId: string;
  intents?: Intent[];
}

const INTENT_CONFIG: Record<IntentType, { icon: any; color: string; label: string }> = {
  buying_signal: { icon: Zap, color: "text-success bg-success/10 border-success/20", label: "Sinal de Compra" },
  objection: { icon: AlertCircle, color: "text-warning bg-warning/10 border-warning/20", label: "Objeção" },
  comparison: { icon: Repeat, color: "text-info bg-info/10 border-info/20", label: "Comparação" },
  technical: { icon: MessageCircle, color: "text-primary bg-primary/10 border-primary/20", label: "Dúvida Técnica" },
  closing: { icon: ShoppingCart, color: "text-primary bg-primary/10 border-primary/20", label: "Fechamento" },
  followup: { icon: Target, color: "text-muted-foreground bg-muted border-border", label: "Follow-up" },
};

export const IntentTracker = ({ intents = [] }: Props) => {
  if (intents.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="size-4 text-primary" />
            Mapeamento de Intenções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground italic">Nenhuma intenção específica detectada nesta chamada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="size-4 text-primary" />
          Mapeamento de Intenções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {intents.map((intent, i) => {
          const config = INTENT_CONFIG[intent.type];
          const Icon = config.icon;
          return (
            <div key={i} className="flex gap-3 group">
              <div className={`mt-0.5 size-7 rounded-full flex items-center justify-center border shrink-0 ${config.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{config.label}</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4">
                    {Math.round(intent.confidence * 100)}% conf.
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  "{intent.excerpt}"
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {Math.floor(intent.timestamp_sec / 60)}:{(intent.timestamp_sec % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
