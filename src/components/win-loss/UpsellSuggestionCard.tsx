import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useUpsellSuggestions } from "@/hooks/win-loss/useUpsellSuggestions";

interface Props {
  saleId: string | undefined;
}

export function UpsellSuggestionCard({ saleId }: Props) {
  const { data = [], isLoading } = useUpsellSuggestions(saleId);

  if (!saleId || isLoading || !data.length) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
          Sugestões de upsell
          <span className="text-xs text-muted-foreground font-normal ml-auto">com base em {data[0]?.basedOn} wins similares</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {data.map(s => (
          <div key={s.product} className="flex items-center justify-between text-xs">
            <span className="truncate flex-1 mr-2">{s.product}</span>
            <Badge variant="outline" className="tabular-nums">{s.attachRate.toFixed(0)}% attach</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
