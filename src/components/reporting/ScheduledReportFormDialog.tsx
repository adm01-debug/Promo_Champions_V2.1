import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useCustomReports } from "@/hooks/reporting/useCustomReports";
import { useCreateScheduledReport } from "@/hooks/reporting/useScheduledReports";
import { isValidEmail, WEEKDAYS, type ScheduleFrequency, type ScheduleFormat } from "./scheduledReportHelpers";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ScheduledReportFormDialog = ({ open, onOpenChange }: Props) => {
  const { data: reports = [] } = useCustomReports();
  const create = useCreateScheduledReport();

  const [reportId, setReportId] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("daily");
  const [hour, setHour] = useState(8);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [format, setFormat] = useState<ScheduleFormat>("csv");
  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);

  const reset = useCallback(() => {
    setReportId(""); setName(""); setFrequency("daily"); setHour(8);
    setDayOfWeek(1); setDayOfMonth(1); setFormat("csv");
    setEmailInput(""); setRecipients([]);
  }, []);

  const addEmail = useCallback(() => {
    const e = emailInput.trim();
    if (!e) return;
    if (!isValidEmail(e)) { toast.error("Email inválido"); return; }
    if (recipients.includes(e)) { toast.error("Email já adicionado"); return; }
    setRecipients((r) => [...r, e]);
    setEmailInput("");
  }, [emailInput, recipients]);

  const canSubmit = useMemo(
    () => !!reportId && name.trim().length > 0,
    [reportId, name],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    await create.mutateAsync({
      report_id: reportId,
      name: name.trim(),
      frequency,
      hour_of_day: hour,
      day_of_week: frequency === "weekly" ? dayOfWeek : null,
      day_of_month: frequency === "monthly" ? dayOfMonth : null,
      recipients,
      format,
    });
    reset();
    onOpenChange(false);
  }, [canSubmit, reportId, name, frequency, hour, dayOfWeek, dayOfMonth, recipients, format, create, reset, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Relatório</Label>
            <Select value={reportId} onValueChange={setReportId}>
              <SelectTrigger><SelectValue placeholder="Escolha um relatório" /></SelectTrigger>
              <SelectContent>
                {reports.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
                {!reports.length && <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum relatório criado</div>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nome do agendamento</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: KPIs semanais" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as ScheduleFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hora (0-23)</Label>
              <Input type="number" min={0} max={23} value={hour} onChange={(e) => setHour(Math.max(0, Math.min(23, Number(e.target.value))))} />
            </div>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((w, i) => (
                    <SelectItem key={i} value={String(i)}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-1.5">
              <Label>Dia do mês (1-28)</Label>
              <Input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(Math.max(1, Math.min(28, Number(e.target.value))))} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Formato</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ScheduleFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Destinatários (opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                placeholder="email@exemplo.com"
              />
              <Button type="button" variant="outline" size="sm" onClick={addEmail}>Adicionar</Button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {recipients.map((e) => (
                  <Badge key={e} variant="secondary" className="gap-1">
                    {e}
                    <button onClick={() => setRecipients((r) => r.filter((x) => x !== e))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || create.isPending}>
            {create.isPending ? "Criando..." : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
