import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain, AlertTriangle, TrendingDown, Clock,
  Target, ChevronDown, ChevronUp, RefreshCw,
  Sparkles, Users, Shield, Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface ChurnPrediction {
  clientId: string;
  displayName: string;
  riskScore: number;
  riskLevel: "high" | "medium";
  daysSinceLastPurchase: number;
  daysSinceLastContact: number;
  purchaseFrequencyDrop: number;
  factors: string[];
  suggestedActions: string[];
}

interface ChurnPredictionPanelProps {
  predictions?: ChurnPrediction[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const DEFAULT_PREDICTIONS: ChurnPrediction[] = [
  { clientId: "1", displayName: "Tech Solutions LTDA", riskScore: 87, riskLevel: "high", daysSinceLastPurchase: 95, daysSinceLastContact: 45, purchaseFrequencyDrop: 60, factors: ["Sem compras há 95 dias", "Frequência caiu 60%", "Último contato há 45 dias"], suggestedActions: ["Agendar reunião de reativação", "Oferecer desconto especial", "Enviar case de sucesso relevante"] },
  { clientId: "2", displayName: "Inovação Digital SA", riskScore: 72, riskLevel: "medium", daysSinceLastPurchase: 60, daysSinceLastContact: 30, purchaseFrequencyDrop: 35, factors: ["Ticket médio caiu 35%", "Menor engajamento"], suggestedActions: ["Follow-up personalizado", "Apresentar novos produtos"] },
  { clientId: "3", displayName: "Global Services ME", riskScore: 65, riskLevel: "medium", daysSinceLastPurchase: 50, daysSinceLastContact: 20, purchaseFrequencyDrop: 25, factors: ["Compras menos frequentes", "Concorrência identificada"], suggestedActions: ["Análise competitiva", "Proposta de valor diferenciada"] },
];

const RiskBadge = ({ level }: { level: "high" | "medium" }) => {
  const config = {
    high: {
      label: "Alto Risco",
      className: "bg-destructive/20 text-destructive border-destructive/30",
      icon: AlertTriangle,
    },
    medium: {
      label: "Médio Risco",
      className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      icon: TrendingDown,
    },
  };

  const { label, className, icon: Icon } = config[level];

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const PredictionCard = ({
  prediction,
  index,
}: {
  prediction: ChurnPrediction;
  index: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-3 text-left">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {prediction.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{prediction.displayName}</span>
                  <RiskBadge level={prediction.riskLevel} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {prediction.daysSinceLastPurchase}d sem compra
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Score: {prediction.riskScore}%
                  </span>
                </div>
              </div>

              {/* Toggle */}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Risk Score Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Score de Risco</span>
                  <span className="font-medium">{prediction.riskScore}%</span>
                </div>
                <Progress
                  value={prediction.riskScore}
                  className={cn(
                    "h-2",
                    prediction.riskLevel === "high"
                      ? "[&>[role=progressbar]]:bg-destructive"
                      : "[&>[role=progressbar]]:bg-yellow-500"
                  )}
                />
              </div>

              {/* Factors */}
              <div>
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Fatores de Risco
                </p>
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.map((factor, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  Ações Sugeridas
                </p>
                <ul className="space-y-1">
                  {prediction.suggestedActions.map((action, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-primary mt-0.5">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
};

export function ChurnPredictionPanel({
  predictions: externalPredictions,
  isLoading = false,
  onRefresh,
  className,
}: ChurnPredictionPanelProps) {
  const predictions = externalPredictions || DEFAULT_PREDICTIONS;
  const sortedPredictions = useMemo(
    () => [...predictions].sort((a, b) => b.riskScore - a.riskScore),
    [predictions]
  );

  const highRiskCount = predictions.filter((p) => p.riskLevel === "high").length;
  const mediumRiskCount = predictions.filter((p) => p.riskLevel === "medium").length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            Predição de Churn
            <Badge variant="secondary" className="text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">
              {highRiskCount} alto risco
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">
              {mediumRiskCount} médio risco
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {predictions.length} total
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sortedPredictions.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Nenhum risco identificado</p>
            <p className="text-xs text-muted-foreground">
              Todos os clientes estão saudáveis
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPredictions.map((prediction, index) => (
              <PredictionCard
                key={prediction.clientId}
                prediction={prediction}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
