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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useUnassignedClients } from "@/hooks/crm/useClientPortfolio";
import {
  useAutoRouteToTopPerformer,
  useRoundRobinRoute,
  useRouteLeadManually,
  useSalespersonPerformance,
} from "@/hooks/useLeadRouting";
import { Loader2, Zap, RotateCcw, UserPlus } from "lucide-react";

interface AutoRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RoutingStrategy = "top_performer" | "round_robin" | "manual";

export function AutoRouteDialog({ open, onOpenChange }: AutoRouteDialogProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [strategy, setStrategy] = useState<RoutingStrategy>("top_performer");
  const [manualSalesperson, setManualSalesperson] = useState<string>("");
  const [manualReason, setManualReason] = useState<string>("");

  const { data: unassignedClients, isLoading: loadingClients } = useUnassignedClients();
  const { data: performers, isLoading: loadingPerformers } = useSalespersonPerformance();

  const autoRoute = useAutoRouteToTopPerformer();
  const roundRobin = useRoundRobinRoute();
  const manualRoute = useRouteLeadManually();

  const isLoading = autoRoute.isPending || roundRobin.isPending || manualRoute.isPending;

  const handleSubmit = () => {
    if (!selectedClient) return;

    const onSuccess = () => {
      setSelectedClient("");
      setManualSalesperson("");
      setManualReason("");
      onOpenChange(false);
    };

    switch (strategy) {
      case "top_performer":
        autoRoute.mutate({ clientId: selectedClient }, { onSuccess });
        break;
      case "round_robin":
        roundRobin.mutate({ clientId: selectedClient }, { onSuccess });
        break;
      case "manual":
        if (!manualSalesperson) return;
        manualRoute.mutate(
          {
            clientId: selectedClient,
            toSalespersonId: manualSalesperson,
            reason: manualReason || "Atribuição manual",
          },
          { onSuccess }
        );
        break;
    }
  };

  const topPerformer = performers?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rotear Lead</DialogTitle>
          <DialogDescription>
            Escolha como distribuir o lead para um vendedor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Lead / Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : unassignedClients?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Todos os leads já estão atribuídos
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

          <div className="grid gap-3">
            <Label>Estratégia de Roteamento</Label>
            <RadioGroup
              value={strategy}
              onValueChange={(v) => setStrategy(v as RoutingStrategy)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-status-warning/30 bg-status-warning/5 cursor-pointer hover:bg-status-warning/10 transition-colors">
                <RadioGroupItem value="top_performer" id="top_performer" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="top_performer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4 text-status-warning" />
                    Top Performer
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Atribui ao vendedor com melhor performance no mês
                    {topPerformer && (
                      <span className="block mt-1 font-medium text-foreground">
                        → {topPerformer.name} (R$ {topPerformer.totalSales.toLocaleString("pt-BR")})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="round_robin" id="round_robin" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="round_robin" className="flex items-center gap-2 cursor-pointer">
                    <RotateCcw className="h-4 w-4 text-primary" />
                    Distribuição Equilibrada
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Atribui ao vendedor com menos clientes na carteira
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="manual" id="manual" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
                    <UserPlus className="h-4 w-4" />
                    Manual
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escolha manualmente o vendedor responsável
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {strategy === "manual" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="manual-sp">Vendedor</Label>
                <Select value={manualSalesperson} onValueChange={setManualSalesperson}>
                  <SelectTrigger id="manual-sp">
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPerformers ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      performers?.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.name} ({sp.activeClientsCount} clientes)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Motivo (opcional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Por que este vendedor foi escolhido?"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="h-20"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedClient ||
              isLoading ||
              (strategy === "manual" && !manualSalesperson)
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Rotear Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
