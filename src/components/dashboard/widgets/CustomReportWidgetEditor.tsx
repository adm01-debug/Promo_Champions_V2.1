import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomReports } from "@/hooks/reporting/useCustomReports";
import { FileBarChart } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReportId?: string;
  initialHeight?: number;
  onSave: (config: { report_id: string; height: number }) => void;
}

export function CustomReportWidgetEditor({ open, onOpenChange, initialReportId, initialHeight = 360, onSave }: Props) {
  const { data: reports = [], isLoading } = useCustomReports();
  const [reportId, setReportId] = useState<string | undefined>(initialReportId);
  const [height, setHeight] = useState<number>(initialHeight);

  const handleSave = () => {
    if (!reportId) return;
    onSave({ report_id: reportId, height });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FileBarChart className="h-5 w-5 text-primary" />
            Configurar Relatório Customizado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Relatório</Label>
            <Select value={reportId} onValueChange={setReportId} disabled={isLoading}>
              <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um relatório"} /></SelectTrigger>
              <SelectContent>
                {reports.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
                {reports.length === 0 && !isLoading && (
                  <div className="px-2 py-3 text-xs text-muted-foreground">Nenhum relatório disponível</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Altura do widget</Label>
              <span className="text-xs text-muted-foreground">{height}px</span>
            </div>
            <Slider value={[height]} onValueChange={(v) => setHeight(v[0])} min={300} max={800} step={20} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!reportId}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
