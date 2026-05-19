import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClientPortfolioItem,
  useUpdatePortfolioStatus,
  useRemoveFromPortfolio,
} from "@/hooks/crm/useClientPortfolio";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
} from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import { useICPDataMap, ICPData } from "@/hooks/useICPData";
import { usePagination } from "@/hooks/usePagination";
import { PortfolioTableRow } from "./PortfolioTableRow";

type SortField = "client" | "icp" | "status" | "lastPurchase" | "assignedAt";
type SortDirection = "asc" | "desc";

interface PortfolioTableProps {
  data: ClientPortfolioItem[] | undefined;
  isLoading: boolean;
}

export function PortfolioTable({ data, isLoading }: PortfolioTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const updateStatus = useUpdatePortfolioStatus();
  const removeFromPortfolio = useRemoveFromPortfolio();
  const { icpMap } = useICPDataMap();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const getIcpSortValue = (icpData: ICPData | undefined): number => {
    if (!icpData) return 0;
    if (icpData.is_icp_match) return 3;
    if (icpData.ramo_atividade || icpData.grupo_nicho) return 2;
    return 1;
  };

  const sortedData = useMemo(() => {
    if (!data || !sortField) return data;

    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "client":
          comparison = (a.client?.name || "").localeCompare(b.client?.name || "");
          break;
        case "icp": {
          const icpA = a.client_id ? icpMap.get(a.client_id) : undefined;
          const icpB = b.client_id ? icpMap.get(b.client_id) : undefined;
          comparison = getIcpSortValue(icpA) - getIcpSortValue(icpB);
          break;
        }
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        case "lastPurchase": {
          const dateA = a.last_purchase_date ? new Date(a.last_purchase_date).getTime() : 0;
          const dateB = b.last_purchase_date ? new Date(b.last_purchase_date).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case "assignedAt":
          comparison = new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection, icpMap]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(sortedData || [], { initialItemsPerPage: 10 });

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
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("client")}
                >
                  Cliente
                  {getSortIcon("client")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("icp")}
                >
                  ICP
                  {getSortIcon("icp")}
                </Button>
              </TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("lastPurchase")}
                >
                  Última Compra
                  {getSortIcon("lastPurchase")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("assignedAt")}
                >
                  Atribuído Em
                  {getSortIcon("assignedAt")}
                </Button>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => {
              const icpData = item.client_id ? icpMap.get(item.client_id) : null;
              return (
                <PortfolioTableRow
                  key={item.id}
                  item={item}
                  icpData={icpData}
                  onToggleStatus={handleToggleStatus}
                  onDelete={setDeleteId}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

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
