import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCadences, useCadenceSteps, useEnrollInCadence } from "@/hooks/useCadences";
import { useSalespeople } from "@/hooks/useSalespeople";
import { CadenceCard } from "./CadenceCard";
import { Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnrollCadenceDialogProps {
  saleId: string;
  clientName: string;
  trigger?: React.ReactNode;
}

export function EnrollCadenceDialog({ saleId, clientName, trigger }: EnrollCadenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCadenceId, setSelectedCadenceId] = useState<string | null>(null);
  const [salespersonId, setSalespersonId] = useState<string>("");

  const { data: cadences } = useCadences();
  const { data: salespeople } = useSalespeople();
  const { data: steps } = useCadenceSteps(selectedCadenceId || undefined);
  const enrollInCadence = useEnrollInCadence();

  const activeCadences = cadences?.filter(c => c.is_active) || [];

  const handleEnroll = async () => {
    if (!selectedCadenceId) return;

    await enrollInCadence.mutateAsync({
      sale_id: saleId,
      cadence_id: selectedCadenceId,
      salesperson_id: salespersonId || undefined,
    });

    setOpen(false);
    setSelectedCadenceId(null);
    setSalespersonId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="h-3.5 w-3.5" />
            Iniciar Cadência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Inscrever em Cadência</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm">
              <span className="text-muted-foreground">Prospect:</span>{" "}
              <span className="font-medium">{clientName}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o vendedor responsável" />
              </SelectTrigger>
              <SelectContent>
                {salespeople?.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Selecione uma Cadência</Label>
            {activeCadences.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Nenhuma cadência disponível. Crie uma primeiro.
              </p>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-3">
                  {activeCadences.map(cadence => (
                    <CadenceCardWithSteps
                      key={cadence.id}
                      cadence={cadence}
                      isSelected={selectedCadenceId === cadence.id}
                      onSelect={() => setSelectedCadenceId(cadence.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleEnroll}
            disabled={!selectedCadenceId || enrollInCadence.isPending}
          >
            {enrollInCadence.isPending ? "Inscrevendo..." : "Iniciar Cadência"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CadenceCardWithSteps({ 
  cadence, 
  isSelected, 
  onSelect 
}: { 
  cadence: any; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const { data: steps } = useCadenceSteps(cadence.id);
  
  return (
    <CadenceCard
      cadence={cadence}
      steps={steps || []}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}
