import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClientPortfolioItem,
  useUpdatePortfolioStatus,
  useRemoveFromPortfolio,
} from "@/hooks/useClientPortfolio";
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ICPBadge } from "@/components/shared/ICPBadge";
import { useICPDataMap } from "@/hooks/useICPData";

interface PortfolioTableProps {
  data: ClientPortfolioItem[] | undefined;
  isLoading: boolean;
}

export function PortfolioTable({ data, isLoading }: PortfolioTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const updateStatus = useUpdatePortfolioStatus();
  const removeFromPortfolio = useRemoveFromPortfolio();
  const { icpMap } = useICPDataMap();

  const handleToggleStatus = (item: ClientPortfolioItem) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    updateStatus.mutate({
      portfolioId: item.id,
      status: newStatus,
      lastPurchaseDate:
        newStatus === "active" ? new Date().toISOString().split("T")[0] : undefined,
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      removeFromPortfolio.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum cliente no portfólio</p>
        <p className="text-sm">Atribua clientes usando o botão acima</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead>Atribuído Em</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="group">
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.client?.name || "—"}</p>
                      {item.client_id && (
                        <ICPBadge icpData={icpMap.get(item.client_id)} size="sm" />
                      )}
                    </div>
                    {item.client?.company && (
                      <p className="text-sm text-muted-foreground">
                        {item.client.company}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.client?.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {item.client.email}
                      </div>
                    )}
                    {item.client?.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {item.client.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {item.salesperson?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <span className="text-sm">{item.salesperson?.name || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "active" ? "default" : "secondary"}
                    className={
                      item.status === "active"
                        ? "bg-status-success/20 text-status-success hover:bg-status-success/30"
                        : "bg-status-warning/20 text-status-warning hover:bg-status-warning/30"
                    }
                  >
                    {item.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.last_purchase_date ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(item.last_purchase_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(item.assigned_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                        {item.status === "active" ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Marcar como Inativo
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Marcar como Ativo
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover do Portfólio
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remover do Portfólio"
        description="Tem certeza que deseja remover este cliente do portfólio? O cliente não será excluído, apenas desvinculado do vendedor."
        isDeleting={removeFromPortfolio.isPending}
      />
    </>
  );
}
