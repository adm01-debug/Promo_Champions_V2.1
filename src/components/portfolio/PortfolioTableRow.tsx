import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserX, Trash2, Calendar, Mail, Phone } from "lucide-react";
import { ICPBadge } from "@/components/shared/ICPBadge";
import type { ClientPortfolioItem } from "@/hooks/crm/useClientPortfolio";
import type { ICPData } from "@/hooks/useICPData";

interface PortfolioTableRowProps {
  item: ClientPortfolioItem;
  icpData: ICPData | null | undefined;
  onToggleStatus: (item: ClientPortfolioItem) => void;
  onDelete: (id: string) => void;
}

export const PortfolioTableRow = React.memo(function PortfolioTableRow({
  item, icpData, onToggleStatus, onDelete,
}: PortfolioTableRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{item.client?.name || "—"}</p>
            {item.client?.is_activated && (
              <Badge variant="outline" className="h-4 text-[8px] px-1 py-0 bg-primary/10 text-primary border-primary/20">
                ATIVADO
              </Badge>
            )}
          </div>
          {item.client?.company && <p className="text-sm text-muted-foreground">{item.client.company}</p>}
        </div>
      </TableCell>
      <TableCell>
        <ICPBadge icpData={icpData} size="md" showTooltip={true} />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {item.client?.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />{item.client.email}
            </div>
          )}
          {item.client?.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />{item.client.phone}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{item.salesperson?.name?.charAt(0) || "?"}</span>
          </div>
          <span className="text-sm">{item.salesperson?.name || "—"}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={item.status === "active" ? "default" : "secondary"}
          className={item.status === "active"
            ? "bg-status-success/20 text-status-success hover:bg-status-success/30"
            : "bg-status-warning/20 text-status-warning hover:bg-status-warning/30"}
        >
          {item.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>
        {item.last_purchase_date ? (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {format(new Date(item.last_purchase_date), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.assigned_at), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Detalhes" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleStatus(item)}>
              {item.status === "active" ? (
                <><UserX className="mr-2 h-4 w-4" />Marcar como Inativo</>
              ) : (
                <><UserCheck className="mr-2 h-4 w-4" />Marcar como Ativo</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" />Remover do Portfólio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
