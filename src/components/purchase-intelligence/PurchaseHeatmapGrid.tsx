import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Info } from "lucide-react";
import { usePurchaseHeatmap, type HeatmapCell } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import { intensityColor, formatBRL, monthLabelFromIso } from "./purchaseIntelligenceHelpers";

interface Props {
  clientId?: string;
  months?: number;
}

interface MatrixCell {
  month: string;
  totalRevenue: number;
  myRevenue: number;
  others: Array<{ name: string; revenue: number }>;
  hasMine: boolean;
  hasOthers: boolean;
  dealCount: number;
}

function buildMatrix(rows: HeatmapCell[]): { months: string[]; clients: Array<{ id: string; name: string; cells: Map<string, MatrixCell> }>; max: number } {
  const monthSet = new Set<string>();
  const byClient = new Map<string, { name: string; cells: Map<string, MatrixCell> }>();
  let max = 0;

  for (const r of rows) {
    monthSet.add(r.month_start);
    const c = byClient.get(r.client_id) ?? { name: r.client_name, cells: new Map() };
    const cell = c.cells.get(r.month_start) ?? {
      month: r.month_start,
      totalRevenue: 0,
      myRevenue: 0,
      others: [],
      hasMine: false,
      hasOthers: false,
      dealCount: 0,
    };
    cell.totalRevenue += Number(r.revenue);
    cell.dealCount += Number(r.deal_count);
    if (r.is_current_user) {
      cell.hasMine = true;
      cell.myRevenue += Number(r.revenue);
    } else {
      cell.hasOthers = true;
      cell.others.push({ name: r.salesperson_name ?? "Outro vendedor", revenue: Number(r.revenue) });
    }
    if (cell.totalRevenue > max) max = cell.totalRevenue;
    c.cells.set(r.month_start, cell);
    byClient.set(r.client_id, c);
  }

  const months = Array.from(monthSet).sort();
  const clients = Array.from(byClient.entries()).map(([id, c]) => ({ id, name: c.name, cells: c.cells }));
  // sort clients by total revenue desc
  clients.sort((a, b) => {
    const sumA = Array.from(a.cells.values()).reduce((s, c) => s + c.totalRevenue, 0);
    const sumB = Array.from(b.cells.values()).reduce((s, c) => s + c.totalRevenue, 0);
    return sumB - sumA;
  });
  return { months, clients, max };
}

export function PurchaseHeatmapGrid({ clientId, months = 24 }: Props) {
  const { data: rows, isLoading } = usePurchaseHeatmap(clientId, months);
  const matrix = useMemo(() => buildMatrix(rows ?? []), [rows]);

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <Flame className="mx-auto mb-3 h-8 w-8 opacity-40" />
          Sem histórico de compras nos últimos {months} meses.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-primary" />
          Mapa de Calor de Compras ({matrix.months.length} meses)
        </CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border-2 border-primary" /> Minhas
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-warning" /> Outros
          </span>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider delayDuration={100}>
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background text-left text-xs font-medium text-muted-foreground pr-3 pb-2 min-w-[160px]">
                  Cliente
                </th>
                {matrix.months.map((m) => (
                  <th key={m} className="text-[10px] font-medium text-muted-foreground pb-2 min-w-[44px] -rotate-45 origin-bottom-left whitespace-nowrap">
                    {monthLabelFromIso(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.clients.slice(0, 25).map((c) => (
                <tr key={c.id}>
                  <td className="sticky left-0 bg-background pr-3 text-sm font-medium truncate max-w-[160px]">
                    {c.name}
                  </td>
                  {matrix.months.map((m) => {
                    const cell = c.cells.get(m);
                    const bg = cell ? intensityColor(cell.totalRevenue, matrix.max) : "hsl(var(--muted) / 0.2)";
                    const borderClass = cell?.hasMine
                      ? "border-2 border-primary"
                      : cell?.hasOthers
                      ? "border-2 border-dashed border-warning"
                      : "border border-border/30";
                    return (
                      <td key={m} className="p-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-9 w-11 rounded-sm cursor-pointer transition-transform hover:scale-110 ${borderClass}`}
                              style={{ backgroundColor: bg }}
                            />
                          </TooltipTrigger>
                          {cell && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1 text-xs">
                                <div className="font-semibold">{c.name}</div>
                                <div className="text-muted-foreground">{monthLabelFromIso(m)}</div>
                                <div>Total: <strong>{formatBRL(cell.totalRevenue)}</strong> ({cell.dealCount} {cell.dealCount === 1 ? "venda" : "vendas"})</div>
                                {cell.hasMine && (
                                  <div className="text-primary">Minhas: {formatBRL(cell.myRevenue)}</div>
                                )}
                                {cell.others.length > 0 && (
                                  <div className="text-warning">
                                    Outros: {cell.others.map((o) => `${o.name} (${formatBRL(o.revenue)})`).join(", ")}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
        {matrix.clients.length > 25 && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Mostrando top 25 de {matrix.clients.length} clientes por receita.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
