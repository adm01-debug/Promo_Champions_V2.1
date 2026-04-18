import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MessagesSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { useConversationInsights } from "@/hooks/conversation-intelligence/useConversationInsights";
import { TranscriptAnalyzerDialog } from "./TranscriptAnalyzerDialog";
import { AnalysisResultCard } from "./AnalysisResultCard";
import { ObjectionsTrendChart } from "./ObjectionsTrendChart";
import { SentimentDistributionCard } from "./SentimentDistributionCard";

export const ConversationHub = () => {
  const { data, isLoading, insights } = useConversationInsights(60);
  const items = data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Conversation Intelligence
          </h2>
          <p className="text-sm text-muted-foreground">
            Análise de calls, reuniões, e-mails e WhatsApp com IA — extrai sentimento, objeções e sinais de compra.
          </p>
        </div>
        <TranscriptAnalyzerDialog />
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Kpi icon={<MessagesSquare className="h-4 w-4" />} label="Análises" value={insights.total} />
        <Kpi icon={<TrendingUp className="h-4 w-4 text-status-success" />} label="Sinais de compra" value={insights.buyingSignalsTotal} />
        <Kpi icon={<AlertTriangle className="h-4 w-4 text-status-warning" />} label="Sinais de risco" value={insights.riskSignalsTotal} />
        <Kpi
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          label="Sentimento positivo"
          value={`${insights.total > 0
            ? Math.round(((insights.sentiment.find((s) => s.sentiment === "positive")?.value ?? 0) / insights.total) * 100)
            : 0}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SentimentDistributionCard data={insights.sentiment} />
        <ObjectionsTrendChart data={insights.topObjections} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Análises recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Nenhuma conversa analisada ainda. Cole uma transcrição para começar.
            </div>
          ) : (
            items.map((a) => <AnalysisResultCard key={a.id} analysis={a} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Kpi = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <Card>
    <CardContent className="pt-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </CardContent>
  </Card>
);
