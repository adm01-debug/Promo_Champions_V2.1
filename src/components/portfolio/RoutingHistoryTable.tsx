import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, User, Building2, Zap, RotateCcw, UserPlus } from "lucide-react";

interface RoutingHistoryTableProps {
  data: RoutingLogEntry[] | undefined;
  isLoading: boolean;
}

const getRoutingIcon = (reason: string) => {
  if (reason.includes("Top Performer") || reason.includes("automático")) {
    return <Zap className="h-4 w-4 text-status-warning" />;
  }
  if (reason.includes("Round-Robin") || reason.includes("equilibrada")) {
    return <RotateCcw className="h-4 w-4 text-primary" />;
  }
  return <UserPlus className="h-4 w-4 text-muted-foreground" />;
};

const getRoutingBadgeVariant = (reason: string) => {
  if (reason.includes("Top Performer") || reason.includes("automático")) {
    return "bg-status-warning/20 text-status-warning border-status-warning/30";
  }
  if (reason.includes("Round-Robin") || reason.includes("equilibrada")) {
    return "bg-primary/20 text-primary border-primary/30";
  }
  return "bg-muted text-muted-foreground";
};

export function RoutingHistoryTable({ data, isLoading }: RoutingHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum histórico de roteamento</p>
        <p className="text-sm">Os roteamentos de leads aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Roteamento</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.id} className="group">
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {entry.client?.name || "Cliente desconhecido"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {entry.from_salesperson ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{entry.from_salesperson.name}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Novo</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {entry.to_salesperson?.name || "—"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getRoutingBadgeVariant(entry.routing_reason)} flex items-center gap-1 w-fit`}
                >
                  {getRoutingIcon(entry.routing_reason)}
                  <span className="truncate max-w-[200px]">{entry.routing_reason}</span>
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {entry.notes || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
