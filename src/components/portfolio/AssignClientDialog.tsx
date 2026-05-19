import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { useUnassignedClients, useAssignClient } from "@/hooks/crm/useClientPortfolio";
import { Loader2 } from "lucide-react";

interface AssignClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedSalespersonId?: string;
}

export function AssignClientDialog({
  open,
  onOpenChange,
  preSelectedSalespersonId,
}: AssignClientDialogProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>(
    preSelectedSalespersonId || ""
  );

  const { data: salespeople, isLoading: loadingSalespeople } = useSalespeople();
  const { data: unassignedClients, isLoading: loadingClients } = useUnassignedClients();
  const assignClient = useAssignClient();

  // Filter to only show Closers and Hybrids (they manage portfolios)
  const closers = salespeople?.filter(
    (sp) => sp.role === "closer" || sp.role === "hybrid"
  );

  const handleSubmit = () => {
    if (!selectedClient || !selectedSalesperson) return;

    assignClient.mutate(
      {
        clientId: selectedClient,
        salespersonId: selectedSalesperson,
        source: "manual",
      },
      {
        onSuccess: () => {
          setSelectedClient("");
          if (!preSelectedSalespersonId) {
            setSelectedSalesperson("");
          }
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Cliente ao Portfólio</DialogTitle>
          <DialogDescription>
            Selecione um cliente e o Closer responsável pelo gerenciamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : unassignedClients?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Todos os clientes já estão atribuídos
                  </div>
                ) : (
                  unassignedClients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.company && ` - ${client.company}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="salesperson">Closer Responsável</Label>
            <Select
              value={selectedSalesperson}
              onValueChange={setSelectedSalesperson}
              disabled={!!preSelectedSalespersonId}
            >
              <SelectTrigger id="salesperson">
                <SelectValue placeholder="Selecione um Closer" />
              </SelectTrigger>
              <SelectContent>
                {loadingSalespeople ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  closers?.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedClient ||
              !selectedSalesperson ||
              assignClient.isPending
            }
          >
            {assignClient.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
