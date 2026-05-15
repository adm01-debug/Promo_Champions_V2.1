import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  AlertCircle, 
  Clock, 
  FileText, 
  ChevronRight,
  Sparkles,
  Target
} from "lucide-react";

export const PipelineStrategicReview = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Relatório Estratégico AI
              </CardTitle>
              <CardDescription>
                Análise semanal de performance e riscos do pipeline
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3">
              Semana 19 - Maio 2026
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Executive Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryStat 
              label="Pipeline Velocity" 
              value="14.2 dias" 
              trend="+2.1d" 
              trendType="negative" 
              icon={Clock} 
            />
            <SummaryStat 
              label="Win Rate Previsto" 
              value="32%" 
              trend="+4%" 
              trendType="positive" 
              icon={Target} 
            />
            <SummaryStat 
              label="Deals em Risco" 
              value="R$ 1.2M" 
              trend="-150k" 
              trendType="positive" 
              icon={AlertCircle} 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Insights do Analista Virtual
            </h3>
            
            <div className="grid gap-3">
              <InsightCard 
                type="opportunity"
                title="Aceleração detectada no setor Tech"
                description="O tempo médio de fechamento para clientes SaaS reduziu em 15% esta semana. Recomendamos priorizar leads desta categoria."
              />
              <InsightCard 
                type="warning"
                title="Gargalo no estágio de Proposta"
                description="7 deals (R$ 450k) estão parados há mais de 8 dias na fase de proposta técnica. Verifique a carga horária do time de pré-vendas."
              />
              <InsightCard 
                type="info"
                title="Benchmark de Objeções"
                description="Menções a 'Preço' caíram 12% após a nova tabela de descontos entrar em vigor."
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button variant="outline" className="gap-2 group">
              Ver Detalhes Completos
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SummaryStatProps {
  label: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative';
  icon: React.ElementType;
}

const SummaryStat = ({ label, value, trend, trendType, icon: Icon }: SummaryStatProps) => (
  <div className="p-4 rounded-xl border bg-card/50 space-y-2">
    <div className="flex items-center justify-between">
      <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <Badge variant="outline" className={`text-[10px] ${trendType === 'positive' ? 'text-success border-success/30 bg-success/5' : 'text-destructive border-destructive/30 bg-destructive/5'}`}>
        {trendType === 'positive' ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
        {trend}
      </Badge>
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

interface InsightCardProps {
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
}

const InsightCard = ({ type, title, description }: InsightCardProps) => {
  const styles = {
    opportunity: "border-success/20 bg-success/5 text-success",
    warning: "border-warning/20 bg-warning/5 text-warning",
    info: "border-primary/20 bg-primary/5 text-primary",
  }[type];

  return (
    <div className={`p-3 rounded-lg border flex gap-3 ${styles}`}>
      <div className="mt-0.5">
        {type === 'opportunity' && <TrendingUp className="size-4" />}
        {type === 'warning' && <AlertCircle className="size-4" />}
        {type === 'info' && <BarChart3 className="size-4" />}
      </div>
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-xs opacity-90 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
};
