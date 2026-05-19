import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCadences, useCadenceSteps, useEnrollInCadence, Cadence } from "@/hooks/useCadences";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
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
  const { data: _steps } = useCadenceSteps(selectedCadenceId || undefined);
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
          <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors">
            <Play className="h-3.5 w-3.5" />
            Iniciar Cadência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl glass border-border/50 dark:border-glow">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
              <Play className="h-4 w-4 gradient-primary" />
            </div>
            Inscrever em Cadência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/30">
            <p className="text-sm">
              <span className="text-muted-foreground">Prospect:</span>{" "}
              <span className="font-display font-semibold gradient-text">{clientName}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Responsável</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger className="bg-muted/30 border-border/50 focus:border-primary transition-colors">
                <SelectValue placeholder="Selecione o vendedor responsável" />
              </SelectTrigger>
              <SelectContent className="glass border-border/50">
                {salespeople?.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Selecione uma Cadência</Label>
            {activeCadences.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center bg-muted/20 rounded-lg border border-dashed border-border/50">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Nenhuma cadência disponível</p>
                <p className="text-xs mt-1">Crie uma cadência primeiro</p>
              </div>
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
            variant="glow"
            className="w-full font-medium"
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
  cadence: Cadence; 
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
