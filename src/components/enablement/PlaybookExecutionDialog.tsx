import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  PlayCircle,
  FileText,
  Target
} from "lucide-react";
import type { Playbook } from "@/hooks/useSalesEnablement";
import { useTogglePlaybookItem, useAllPlaybookProgress } from "@/hooks/useSalesEnablement";
import { useSalesData } from "@/hooks/useSalesData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PlaybookExecutionDialog = ({ playbook }: { playbook: Playbook }) => {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const { data: sales } = useSalesData();
  const toggleItem = useTogglePlaybookItem();
  const { data: completedItems } = useAllPlaybookProgress(selectedSaleId || undefined);

  const activeSales = (sales || []).filter((s: any) => s.status !== 'completed' && s.status !== 'lost') || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full h-8 text-xs font-bold gap-2 group-hover:glow" variant="secondary">
          Executar Playbook
          <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px] font-black">
              {playbook.stage || "Geral"}
            </Badge>
            <Badge className="bg-success/10 text-success border-success/30 text-[10px]">
              <Zap className="size-3 mr-1" /> Guia Ativo
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-display font-black uppercase italic tracking-tighter">
            {playbook.title}
          </DialogTitle>
          <DialogDescription>
            Selecione um deal para rastrear a execução deste playbook tático.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deal em execução</label>
            <Select onValueChange={setSelectedSaleId} value={selectedSaleId || undefined}>
              <SelectTrigger className="glass border-primary/20">
                <SelectValue placeholder="Selecione um Deal ativo..." />
              </SelectTrigger>
              <SelectContent>
                {activeSales.map((sale: any) => (
                  <SelectItem key={sale.fullId} value={sale.fullId}>
                    {sale.cliente} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSaleId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  Checklist Tático
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {completedItems?.size || 0} / {playbook.items.length} concluídos
                </Badge>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {playbook.items.sort((a, b) => a.item_order - b.item_order).map((item) => {
                    const isCompleted = completedItems?.has(item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-xl border transition-all flex items-start gap-3 group ${
                          isCompleted ? "bg-success/5 border-success/20 opacity-70" : "bg-muted/30 border-border/40 hover:border-primary/30"
                        }`}
                      >
                        <Checkbox 
                          checked={isCompleted}
                          onCheckedChange={(checked) => toggleItem.mutate({
                            playbook_item_id: item.id,
                            sale_id: selectedSaleId,
                            completed: !!checked
                          })}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-relaxed ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {item.item_type === 'asset' && (
                              <Badge variant="outline" className="text-[9px] gap-1 bg-primary/5 text-primary border-primary/20">
                                <FileText className="size-2.5" /> Ativo Vinculado
                              </Badge>
                            )}
                            {item.is_required && (
                              <Badge variant="outline" className="text-[9px] bg-destructive/5 text-destructive border-destructive/20">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-40">
              <PlayCircle className="size-12 mb-4 text-primary" />
              <p className="text-sm font-bold">Aguardando seleção de deal</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
