import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "./cs360Helpers";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  account_id: string;
}

interface CS360OrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusName: string;
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  orders: any[];
  accountById: Map<string, any>;
  orderSortField: string;
  orderSortOrder: "asc" | "desc";
  toggleSort: (field: string) => void;
  sortedAndPaginatedOrders: any[];
  orderPage: number;
  setOrderPage: (page: number) => void;
  totalPages: number;
  ordersByStatus: any[];
  orderModalStatus: string | null;
}

export function CS360OrdersDialog({
  open,
  onOpenChange,
  statusName,
  orderSearch,
  setOrderSearch,
  orders,
  accountById,
  orderSortField,
  orderSortOrder,
  toggleSort,
  sortedAndPaginatedOrders,
  orderPage,
  setOrderPage,
  totalPages,
  ordersByStatus,
  orderModalStatus
}: CS360OrdersDialogProps) {
  const currentStatusInfo = ordersByStatus.find(s => s.key === orderModalStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${currentStatusInfo?.color.replace("text-", "bg-")}`} />
            <DialogTitle className="text-xl font-black font-display uppercase tracking-tight">
              Pedidos: {statusName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Visualizando {orders.length} de {currentStatusInfo?.count} pedidos totais para este status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por número, cliente ou motivo..." 
              className="pl-10 h-10 bg-muted/30 border-primary/20"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
            {orderSearch && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setOrderSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px] cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("order_number")}>
                    Nº Pedido <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("account_name")}>
                    Cliente <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("created_at")}>
                    Data <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("total")}>
                    Valor <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndPaginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAndPaginatedOrders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-bold text-xs">{o.order_number}</TableCell>
                      <TableCell className="font-medium text-xs">
                        {accountById.get(o.account_id)?.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(o.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs">
                        {formatBRL(o.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-[10px] text-muted-foreground">
                Página {orderPage} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setOrderPage(orderPage - 1)}
                  disabled={orderPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setOrderPage(orderPage + 1)}
                  disabled={orderPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
