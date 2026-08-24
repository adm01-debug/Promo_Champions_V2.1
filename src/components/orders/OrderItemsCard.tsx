import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "./orderHelpers";
import type { OrderItemRow } from "@/hooks/orders/useOrder";

export function OrderItemsCard({ items }: { items: OrderItemRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens do pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum item neste pedido.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.product_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.quantity} × {formatBRL(item.unit_price)}
              </p>
            </div>
            <p className="font-display font-semibold tabular-nums">
              {formatBRL(item.quantity * item.unit_price)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
