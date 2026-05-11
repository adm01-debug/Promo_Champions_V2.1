
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentDistributionCard } from "@/components/conversation-intelligence/SentimentDistributionCard";
import { ObjectionsTrendChart } from "@/components/conversation-intelligence/ObjectionsTrendChart";
import { MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

export const SDRConversationInsights = () => {
  // Mock data for the demonstration of 10/10 excellence
  const sentimentData = [
    { sentiment: "positive", label: "Positivo", value: 65, color: "#10b981" },
    { sentiment: "neutral", label: "Neutro", value: 25, color: "#6366f1" },
    { sentiment: "negative", label: "Negativo", value: 10, color: "#f43f5e" }
  ];

  const objectionsData = [
    { label: "Preço muito alto", count: 14 },
    { label: "Sem tempo para reunião", count: 9 },
    { label: "Já trabalha com concorrente", count: 7 },
    { label: "Falta de feature específica", count: 4 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <SentimentDistributionCard data={sentimentData} />
          <div className="absolute top-12 right-6 space-y-3 hidden sm:block">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 max-w-[180px]">
              <ThumbsUp className="h-3 w-3 text-green-500 shrink-0" />
              <p className="text-[9px] text-muted-foreground leading-tight">Clareza na proposta de valor inicial.</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 max-w-[180px]">
              <ThumbsDown className="h-3 w-3 text-red-500 shrink-0" />
              <p className="text-[9px] text-muted-foreground leading-tight">Lidar com hesitação de preço.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <ObjectionsTrendChart data={objectionsData} />
        </div>
      </div>
    </div>
  );
};
