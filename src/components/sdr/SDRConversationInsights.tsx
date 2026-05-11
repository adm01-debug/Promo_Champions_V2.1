
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentDistributionCard } from "@/components/conversation-intelligence/SentimentDistributionCard";
import { ObjectionsTrendChart } from "@/components/conversation-intelligence/ObjectionsTrendChart";
import { MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

export const SDRConversationInsights = () => {
  // Mock data for the demonstration of 10/10 excellence
  const sentimentData = [
    { name: "Positivo", value: 65, color: "#10b981" },
    { name: "Neutro", value: 25, color: "#6366f1" },
    { name: "Negativo", value: 10, color: "#f43f5e" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Sentimento Médio das Ligações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-[180px]">
              <SentimentDistributionCard 
                data={sentimentData} 
                compact 
              />
            </div>
            <div className="w-full sm:w-1/2 space-y-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-[11px] font-bold text-green-500">Ponto Forte</p>
                  <p className="text-[10px] text-muted-foreground">Clareza na proposta de valor inicial.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-[11px] font-bold text-red-500">A Melhorar</p>
                  <p className="text-[10px] text-muted-foreground">Lidar com hesitação de preço prematura.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Top Objeções Detectadas (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ObjectionsTrendChart compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
