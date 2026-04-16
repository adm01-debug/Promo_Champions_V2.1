import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface DealSummary {
  deal_id: string;
  client_name: string;
  amount: number;
  status: string;
  summary: string;
  next_steps: string[];
  risks: string[];
  days_in_stage: number;
}

function generateLocalSummary(deal: {
  client_name: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}): { summary: string; next_steps: string[]; risks: string[] } {
  const daysSince = Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / 86400000);
  const totalDays = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / 86400000);

  const summary = `Deal com ${deal.client_name} de R$ ${deal.amount.toLocaleString("pt-BR")} está em "${deal.status}" há ${daysSince} dia(s). Total no funil: ${totalDays} dia(s).`;

  const next_steps: string[] = [];
  const risks: string[] = [];

  if (deal.status === "lead" || deal.status === "prospecting") {
    next_steps.push("Agendar reunião de qualificação");
    next_steps.push("Validar ICP e budget disponível");
  } else if (deal.status === "qualified") {
    next_steps.push("Preparar proposta comercial");
    next_steps.push("Mapear decisores e influenciadores");
  } else if (deal.status === "proposal") {
    next_steps.push("Follow-up sobre proposta enviada");
    next_steps.push("Preparar contrapropostas se necessário");
  } else if (deal.status === "negotiation") {
    next_steps.push("Negociar termos finais");
    next_steps.push("Preparar contrato para assinatura");
  }

  if (daysSince > 7) risks.push(`Sem atualização há ${daysSince} dias`);
  if (deal.amount > 50000 && daysSince > 5) risks.push("Deal de alto valor estagnado");
  if (totalDays > 60) risks.push("Ciclo de venda acima da média");

  return { summary, next_steps, risks };
}

export const useDealSummaries = (dealIds: string[]) => {
  return useQuery<DealSummary[]>({
    queryKey: ["deal-summaries", dealIds],
    queryFn: async () => {
      if (!dealIds.length) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, amount, status, created_at, updated_at")
        .in("id", dealIds);
      if (error) throw error;

      return (data || []).map((d) => {
        const { summary, next_steps, risks } = generateLocalSummary(d);
        const daysSince = Math.floor((Date.now() - new Date(d.updated_at).getTime()) / 86400000);
        return {
          deal_id: d.id,
          client_name: d.client_name,
          amount: d.amount,
          status: d.status,
          summary,
          next_steps,
          risks,
          days_in_stage: daysSince,
        };
      });
    },
    enabled: dealIds.length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

interface DealSummaryCardProps {
  dealId: string;
  clientName: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const DealSummaryCard = React.memo(({ dealId, clientName, amount, status, createdAt, updatedAt }: DealSummaryCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { summary, next_steps, risks } = generateLocalSummary({
    client_name: clientName,
    amount,
    status,
    created_at: createdAt,
    updated_at: updatedAt,
  });

  const handleCopy = useCallback(() => {
    const text = `${summary}\n\nPróximos passos:\n${next_steps.map((s) => `• ${s}`).join("\n")}\n\nRiscos:\n${risks.map((r) => `⚠ ${r}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Resumo copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [summary, next_steps, risks]);

  return (
    <div className="mt-2 pt-2 border-t border-border/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors w-full"
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-medium">Resumo AI</span>
        {expanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 animate-in fade-in-0 slide-in-from-top-1">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{summary}</p>

          {next_steps.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-foreground mb-1">Próximos Passos:</p>
              {next_steps.map((step, i) => (
                <p key={i} className="text-[10px] text-muted-foreground pl-2">• {step}</p>
              ))}
            </div>
          )}

          {risks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-destructive mb-1">Riscos:</p>
              {risks.map((risk, i) => (
                <p key={i} className="text-[10px] text-destructive/80 pl-2">⚠ {risk}</p>
              ))}
            </div>
          )}

          <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      )}
    </div>
  );
});
DealSummaryCard.displayName = "DealSummaryCard";
