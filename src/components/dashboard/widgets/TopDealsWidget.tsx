import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  pending: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
};

export function TopDealsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["top-deals-widget"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, amount, status, product_name")
        .in("status", ["lead", "pending", "qualified", "proposal", "negotiation"])
        .order("amount", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          Top Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data && data.length > 0 ? data.map((deal, i) => (
          <div key={deal.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
            <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{deal.client_name}</p>
              <p className="text-xs text-muted-foreground truncate">{deal.product_name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">
                R$ {Number(deal.amount).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <Badge variant="outline" className="text-[9px]">
                {STATUS_LABELS[deal.status] || deal.status}
              </Badge>
            </div>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum deal ativo</p>
        )}
      </CardContent>
    </Card>
  );
}
