import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "./orderHelpers";

interface Props {
  subtotal: number;
  shipping: number;
  total: number;
}

export function OrderSummaryCard({ subtotal, shipping, total }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo financeiro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Frete</span>
          <span className="tabular-nums">{formatBRL(shipping)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-2">
          <span className="font-display font-semibold text-base">Total</span>
          <span className="font-display font-semibold text-base tabular-nums">
            {formatBRL(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
