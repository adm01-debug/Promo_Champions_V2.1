import { FC, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { DealHealthScoreBadge } from "../DealHealthScoreBadge";

interface Row {
  id: string;
  sale_id: string;
  health_score: number;
  tier: HealthTier;
  days_in_stage: number | null;
  ai_recommendation: string | null;
  sales?: {
    id: string;
    client_name: string | null;
    product_name: string | null;
    amount: number | null;
    status: string | null;
  } | null;
}

type SortKey = "health_score" | "amount" | "days_in_stage";

interface Props {
  rows: Row[];
}

const fmtBRL = (v: number | null | undefined) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "—";

export const CriticalDealsTable: FC<Props> = ({ rows }) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("health_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => r.tier === "critical" || r.tier === "at_risk");
    if (q) {
      list = list.filter((r) =>
        (r.sales?.client_name || "").toLowerCase().includes(q) ||
        (r.sales?.product_name || "").toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      const av = sortBy === "amount"
        ? (a.sales?.amount ?? 0)
        : sortBy === "days_in_stage"
          ? (a.days_in_stage ?? 0)
          : a.health_score;
      const bv = sortBy === "amount"
        ? (b.sales?.amount ?? 0)
        : sortBy === "days_in_stage"
          ? (b.days_in_stage ?? 0)
          : b.health_score;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list.slice(0, 25);
  }, [rows, search, sortBy, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortBy === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setSortDir(k === "health_score" ? "asc" : "desc"); }
  };

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Deals que Precisam de Atenção
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente/produto..."
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            🎉 Nenhum deal em risco no momento
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente / Produto</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-2 h-7" onClick={() => toggleSort("health_score")}>
                      Score <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-2 h-7" onClick={() => toggleSort("amount")}>
                      Valor <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-2 h-7" onClick={() => toggleSort("days_in_stage")}>
                      Dias <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Recomendação IA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link to={`/vendas/${r.sale_id}`} className="text-sm font-medium hover:underline">
                        {r.sales?.client_name || "—"}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {r.sales?.product_name || ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DealHealthScoreBadge score={r.health_score} tier={r.tier} />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{fmtBRL(r.sales?.amount)}</TableCell>
                    <TableCell className="text-sm tabular-nums">{r.days_in_stage ?? 0}d</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground italic max-w-[280px] truncate">
                      {r.ai_recommendation || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
