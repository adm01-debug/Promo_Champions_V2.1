import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Flame, 
  Info, 
  Maximize2, 
  Minimize2, 
  Filter, 
  Download,
  Search,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { usePurchaseHeatmap, type HeatmapCell } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import { intensityColor, formatBRL, monthLabelFromIso } from "./purchaseIntelligenceHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  anomaly?: "high" | "low";
}

function buildMatrix(rows: HeatmapCell[]): { 
  months: string[]; 
  clients: Array<{ id: string; name: string; cells: Map<string, MatrixCell>; avgMonthly: number }>; 
  max: number 
} {
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
  const clients = Array.from(byClient.entries()).map(([id, c]) => {
    const cellsArray = Array.from(c.cells.values());
    const totalRevenue = cellsArray.reduce((s, cell) => s + cell.totalRevenue, 0);
    const avgMonthly = totalRevenue / Math.max(1, cellsArray.length);

    // Identify anomalies per client
    cellsArray.forEach(cell => {
      if (cell.totalRevenue > avgMonthly * 2.5 && cell.totalRevenue > 5000) cell.anomaly = "high";
      if (cell.totalRevenue < avgMonthly * 0.3 && avgMonthly > 1000) cell.anomaly = "low";
    });

    return { id, name: c.name, cells: c.cells, avgMonthly };
  });

  clients.sort((a, b) => {
    const sumA = Array.from(a.cells.values()).reduce((s, c) => s + c.totalRevenue, 0);
    const sumB = Array.from(b.cells.values()).reduce((s, c) => s + c.totalRevenue, 0);
    return sumB - sumA;
  });

  return { months, clients, max };
}

export function PurchaseHeatmapGrid({ clientId, months = 24 }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: rows, isLoading } = usePurchaseHeatmap(clientId, months);
  
  const matrix = useMemo(() => buildMatrix(rows ?? []), [rows]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return matrix.clients;
    return matrix.clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matrix.clients, searchTerm]);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-2xl" />;
  }

  if (!rows || rows.length === 0) {
    return (
      <Card className="h-full border-dashed border-2 flex items-center justify-center bg-muted/20">
        <CardContent className="py-20 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Flame className="h-8 w-8 text-muted-foreground opacity-30" />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-lg">Sem histórico térmico</p>
            <p className="text-sm text-muted-foreground max-w-[280px]">Não encontramos registros de compras para os parâmetros selecionados nos últimos {months} meses.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-primary/10 bg-card/40 backdrop-blur-sm transition-all duration-500 flex flex-col overflow-hidden",
      isFullscreen ? "fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]" : "h-full min-h-[500px]"
    )}>
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
              Mapa de Calor de Consumo
              <Badge variant="outline" className="ml-2 font-mono text-[10px] uppercase tracking-tighter border-primary/20 bg-primary/5">
                {matrix.months.length} Meses
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Analise a densidade de compras e identifique janelas de oportunidade tática.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Buscar cliente..." 
                className="h-9 w-[180px] pl-8 text-xs bg-muted/40 border-border/50 focus:w-[240px] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/50" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/50">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-2 border-t border-border/40">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-[3px] border-2 border-primary bg-primary/20" /> Minhas Compras
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-[3px] border-2 border-dashed border-orange-500 bg-orange-500/10" /> Mercado/Outros
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-[3px] bg-red-500 animate-pulse" /> Anomalia Alta
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Frio
            <div className="h-2 w-32 rounded-full bg-gradient-to-r from-muted to-primary" />
            Quente
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar p-6">
          <TooltipProvider delayDuration={50}>
            <table className="border-separate border-spacing-[2px] w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-card/95 backdrop-blur-sm text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-4 pb-8 min-w-[200px] border-b border-border/50">
                    Portfolio de Clientes
                  </th>
                  {matrix.months.map((m) => (
                    <th key={m} className="text-[10px] font-bold text-muted-foreground pb-8 min-w-[50px] relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-[-45deg] origin-bottom-left whitespace-nowrap mb-2">
                        {monthLabelFromIso(m)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredClients.slice(0, isFullscreen ? 100 : 25).map((c, idx) => (
                  <motion.tr 
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    <td className="sticky left-0 z-20 bg-card/95 group-hover:bg-primary/5 backdrop-blur-sm pr-4 py-2 text-sm font-bold border-r border-border/30 transition-colors">
                      <div className="flex items-center gap-2 max-w-[180px]">
                        <div className="w-1.5 h-6 rounded-full bg-muted group-hover:bg-primary transition-colors" />
                        <span className="truncate">{c.name}</span>
                      </div>
                    </td>
                    {matrix.months.map((m) => {
                      const cell = c.cells.get(m);
                      const bg = cell ? intensityColor(cell.totalRevenue, matrix.max) : "hsl(var(--muted) / 0.15)";
                      
                      const borderClass = cell?.hasMine
                        ? "border-[2.5px] border-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]"
                        : cell?.hasOthers
                        ? "border-[2px] border-dashed border-orange-500/60"
                        : "border border-border/20";

                      return (
                        <td key={m} className="p-0.5 group/cell">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <motion.div
                                  whileHover={{ scale: 1.15, zIndex: 30 }}
                                  className={cn(
                                    "h-10 w-full rounded-[4px] cursor-pointer transition-all duration-300",
                                    borderClass,
                                    !cell && "opacity-30 hover:opacity-100"
                                  )}
                                  style={{ backgroundColor: bg }}
                                />
                                {cell?.anomaly && (
                                  <div className={cn(
                                    "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background z-10",
                                    cell.anomaly === "high" ? "bg-red-500 animate-pulse shadow-[0_0_5px_red]" : "bg-blue-400"
                                  )} />
                                )}
                              </div>
                            </TooltipTrigger>
                            <AnimatePresence>
                              {cell && (
                                <TooltipContent side="top" className="p-0 border-none bg-transparent shadow-2xl overflow-hidden" sideOffset={10}>
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-card border border-primary/30 p-4 rounded-xl space-y-3 w-64 backdrop-blur-xl"
                                  >
                                    <div className="flex justify-between items-start border-b border-border/50 pb-2">
                                      <div className="space-y-0.5">
                                        <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{monthLabelFromIso(m)}</div>
                                        <div className="text-sm font-bold truncate max-w-[160px]">{c.name}</div>
                                      </div>
                                      {cell.anomaly && (
                                        <Badge variant={cell.anomaly === "high" ? "destructive" : "outline"} className="text-[9px] h-4 py-0">
                                          {cell.anomaly === "high" ? "Pico" : "Queda"}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center bg-primary/5 p-2 rounded-lg border border-primary/10">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento</span>
                                        <span className="text-sm font-black text-primary">{formatBRL(cell.totalRevenue)}</span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/40 p-2 rounded-lg">
                                          <div className="text-[9px] font-bold text-muted-foreground uppercase">Minhas</div>
                                          <div className="text-xs font-black">{formatBRL(cell.myRevenue)}</div>
                                        </div>
                                        <div className="bg-muted/40 p-2 rounded-lg">
                                          <div className="text-[9px] font-bold text-muted-foreground uppercase">Negócios</div>
                                          <div className="text-xs font-black">{cell.dealCount}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {cell.others.length > 0 && (
                                      <div className="space-y-1.5 pt-1 border-t border-border/50">
                                        <div className="text-[9px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                          <AlertCircle className="h-3 w-3" /> Outros Vendedores
                                        </div>
                                        <div className="space-y-1">
                                          {cell.others.slice(0, 2).map((o, i) => (
                                            <div key={i} className="flex justify-between text-[10px]">
                                              <span className="text-muted-foreground truncate max-w-[100px]">{o.name}</span>
                                              <span className="font-bold">{formatBRL(o.revenue)}</span>
                                            </div>
                                          ))}
                                          {cell.others.length > 2 && <div className="text-[9px] text-center text-muted-foreground">+{cell.others.length - 2} outros</div>}
                                        </div>
                                      </div>
                                    )}

                                    {cell.anomaly && (
                                      <div className={cn(
                                        "p-2 rounded-lg text-[10px] font-medium flex items-center gap-2",
                                        cell.anomaly === "high" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                      )}>
                                        {cell.anomaly === "high" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        Comportamento atípico detectado no período.
                                      </div>
                                    )}
                                  </motion.div>
                                </TooltipContent>
                              )}
                            </AnimatePresence>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
          {filteredClients.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Search className="mx-auto h-8 w-8 opacity-20 mb-2" />
              Nenhum cliente encontrado para "{searchTerm}"
            </div>
          )}
        </div>
        
        <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Mostrando {Math.min(filteredClients.length, isFullscreen ? 100 : 25)} de {matrix.clients.length} Clientes</span>
          </div>
          <div className="flex items-center gap-1">
            Data Analytics Engine <span className="text-primary">v4.2</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
