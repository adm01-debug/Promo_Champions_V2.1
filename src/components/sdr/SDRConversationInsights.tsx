import { SentimentDistributionCard } from '@/components/conversation-intelligence/SentimentDistributionCard';
import { ObjectionsTrendChart } from '@/components/conversation-intelligence/ObjectionsTrendChart';
import { ThumbsUp, ThumbsDown, MessageSquareOff } from 'lucide-react';
import { useConversationInsights } from '@/hooks/conversation-intelligence/useConversationInsights';

export const SDRConversationInsights = () => {
  const { insights, isLoading } = useConversationInsights(60);

  if (!isLoading && insights.total === 0) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-8 flex flex-col items-center justify-center gap-2 text-center">
        <MessageSquareOff className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          Sem análises de conversa ainda
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Quando as ligações forem transcritas e analisadas, a distribuição de
          sentimento e as objeções mais comuns aparecem aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <SentimentDistributionCard data={insights.sentiment} />
          <div className="absolute top-12 right-6 space-y-3 hidden sm:block">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 max-w-[180px]">
              <ThumbsUp className="h-3 w-3 text-green-500 shrink-0" />
              <p className="text-[9px] text-muted-foreground leading-tight">
                Clareza na proposta de valor inicial.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 max-w-[180px]">
              <ThumbsDown className="h-3 w-3 text-red-500 shrink-0" />
              <p className="text-[9px] text-muted-foreground leading-tight">
                Lidar com hesitação de preço.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <ObjectionsTrendChart data={insights.topObjections} />
        </div>
      </div>
    </div>
  );
};
