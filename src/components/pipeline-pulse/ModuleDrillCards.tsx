import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, TrendingUp, Route, ArrowRight } from "lucide-react";

interface Module {
  id: string;
  label: string;
  description: string;
  icon: typeof Heart;
  tab: string;
  color: string;
}

const MODULES: Module[] = [
  { id: "health", label: "Deal Health", description: "Saúde individual de cada deal", icon: Heart, tab: "deal-health", color: "text-destructive" },
  { id: "winloss", label: "Win/Loss IA", description: "Razões de ganho e perda", icon: Trophy, tab: "win-loss", color: "text-status-success" },
  { id: "forecast", label: "AI Forecast", description: "Projeção 30/60/90 dias", icon: TrendingUp, tab: "ai-forecast", color: "text-primary" },
  { id: "routing", label: "Smart Routing", description: "Distribuição inteligente", icon: Route, tab: "lead-routing", color: "text-accent-foreground" },
];

interface Props {
  onNavigate: (tab: string) => void;
}

export const ModuleDrillCards: FC<Props> = ({ onNavigate }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {MODULES.map((m) => {
      const Icon = m.icon;
      return (
        <Card key={m.id} variant="interactive" onClick={() => onNavigate(m.tab)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-5 w-5 ${m.color}`} />
              <h3 className="font-display font-semibold text-sm">{m.label}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{m.description}</p>
            <Button size="sm" variant="ghost" className="w-full justify-between h-7 text-xs">
              Abrir hub completo <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      );
    })}
  </div>
);
