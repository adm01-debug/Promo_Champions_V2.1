import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCadences, useCadenceSteps } from "@/hooks/cadences/useCadenceQueries";
import { useEnrollQuoteInCadence } from "@/hooks/cadences/useQuoteCadences";
import { CadenceCard } from "@/components/cadences/CadenceCard";
import { Send } from "lucide-react";
import type { Cadence } from "@/hooks/cadences/useCadenceQueries";

interface Props {
  quoteId: string;
  clientName: string;
  trigger?: React.ReactNode;
}

export function EnrollQuoteCadenceDialog({ quoteId, clientName, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: cadences } = useCadences();
  const enroll = useEnrollQuoteInCadence();

  // Filtra apenas cadências de quote_followup ativas
  const list = (cadences ?? []).filter((c) => {
    const t = (c as Cadence & { cadence_type?: string }).cadence_type;
    return c.is_active && (t === "quote_followup" || !t);
  });

  const handle = async () => {
    if (!selectedId) return;
    await enroll.mutateAsync({ quote_id: quoteId, cadence_id: selectedId });
    setOpen(false);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-3.5 w-3.5" />
            Iniciar Follow-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Follow-up de Orçamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-sm">
              <span className="text-muted-foreground">Cliente:</span>{" "}
              <span className="font-display font-semibold">{clientName}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selecione uma cadência</Label>
            {list.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center bg-muted/20 rounded-lg border border-dashed border-border/50">
                <p className="font-medium">Nenhuma cadência de follow-up disponível</p>
                <p className="text-xs mt-1">Crie uma cadência do tipo "Follow-up de Orçamento"</p>
              </div>
            ) : (
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-3">
                  {list.map((c) => (
                    <CadenceWithSteps key={c.id} cadence={c} selected={selectedId === c.id} onSelect={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <Button variant="default" className="w-full" onClick={handle} disabled={!selectedId || enroll.isPending}>
            {enroll.isPending ? "Iniciando..." : "Iniciar Follow-up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CadenceWithSteps({ cadence, selected, onSelect }: { cadence: Cadence; selected: boolean; onSelect: () => void }) {
  const { data: steps } = useCadenceSteps(cadence.id);
  return <CadenceCard cadence={cadence} steps={steps ?? []} isSelected={selected} onSelect={onSelect} />;
}
