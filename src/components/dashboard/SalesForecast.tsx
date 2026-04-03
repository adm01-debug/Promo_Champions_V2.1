import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const getConfidenceConfig = (confidence: number) => {
  if (confidence >= 80) return { color: "bg-status-success", textColor: "text-status-success", label: "Alta", description: "Dados consistentes com tendência positiva." };
  if (confidence >= 60) return { color: "bg-status-warning", textColor: "text-status-warning", label: "Média", description: "Alguns indicadores variaram. Continue alimentando o pipeline." };
  return { color: "bg-destructive", textColor: "text-destructive", label: "Baixa", description: "Poucos dados disponíveis. Registre mais atividades para maior precisão." };
};

export const SalesForecast = () => {
  const forecast = 85000;
  const confidence = 78;
  const config = getConfidenceConfig(confidence);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Previsão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-xl font-bold">R$ {forecast.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">próximo mês</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              Confiança
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <p className="text-xs font-medium mb-1">Confiança: {config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className={cn("font-semibold", config.textColor)}>
              {confidence}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", config.color)}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className={cn("text-[10px] font-medium", config.textColor)}>
            {config.label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
