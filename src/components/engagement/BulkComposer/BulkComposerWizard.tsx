import { useMemo, useState } from "react";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useCreateBulkJob,
  useBulkJob,
  useSendBulkJob,
  useUpdateDraft,
} from "@/hooks/engagement/useBulkComposer";
import { useScheduleOptimalSend } from "@/hooks/sequences/useSendTimeOptimization";
import { TONE_OPTIONS, LANGUAGE_OPTIONS, STATUS_LABEL, STATUS_TONE } from "./bulkComposerHelpers";
import { BulkDraftRow } from "./BulkDraftRow";
import { toast } from "@/hooks/use-toast";

interface SelectedLead {
  id: string;
  label?: string;
}

interface Props {
  initialLeads?: SelectedLead[];
  jobId?: string;
  onJobCreated?: (jobId: string) => void;
}

export function BulkComposerWizard({ initialLeads = [], jobId: jobIdProp, onJobCreated }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(jobIdProp ? 3 : initialLeads.length ? 2 : 1);
  const [leads, setLeads] = useState<SelectedLead[]>(initialLeads);
  const [manualIds, setManualIds] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("consultivo");
  const [language, setLanguage] = useState("pt-BR");
  const [jobId, setJobId] = useState<string | undefined>(jobIdProp);

  const [optimizeTiming, setOptimizeTiming] = useState(true);
  const createJob = useCreateBulkJob();
  const sendJob = useSendBulkJob();
  const update = useUpdateDraft();
  const scheduleOptimal = useScheduleOptimalSend();
  const { job, drafts, isLoading } = useBulkJob(jobId);

  const handleSend = async () => {
    if (!jobId) return;
    if (!optimizeTiming) {
      sendJob.mutate(jobId);
      return;
    }
    const approved = drafts.filter((d) => d.approved && !d.sent_at && d.recipient_email && d.sale_id);
    if (approved.length === 0) return;
    let scheduled = 0;
    for (const d of approved) {
      try {
        await scheduleOptimal.mutateAsync({
          sale_id: d.sale_id!,
          channel: "email",
          payload: { subject: d.subject, body: d.body, to: d.recipient_email },
        });
        scheduled++;
      } catch {
        /* erro já reportado no hook */
      }
    }
    toast({
      title: "Agendamento concluído",
      description: `${scheduled} e-mails agendados nos horários ótimos.`,
    });
  };

  const counts = useMemo(() => {
    const total = drafts.length;
    const approved = drafts.filter((d) => d.approved && !d.sent_at).length;
    const sent = drafts.filter((d) => d.sent_at).length;
    const errored = drafts.filter((d) => d.error).length;
    return { total, approved, sent, errored };
  }, [drafts]);

  const handleAddManual = () => {
    const ids = manualIds
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) return;
    setLeads((prev) => {
      const set = new Set(prev.map((l) => l.id));
      ids.forEach((id) => set.add(id));
      return Array.from(set).map((id) => ({ id }));
    });
    setManualIds("");
  };

  const handleGenerate = () => {
    if (!prompt.trim() || leads.length === 0) return;
    createJob.mutate(
      { prompt, tone, language, sale_ids: leads.map((l) => l.id) },
      {
        onSuccess: (data) => {
          setJobId(data.job_id);
          setStep(3);
          onJobCreated?.(data.job_id);
        },
      },
    );
  };

  const approveAll = (value: boolean) => {
    drafts
      .filter((d) => !d.sent_at && d.recipient_email)
      .forEach((d) => update.mutate({ id: d.id, patch: { approved: value } }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <StepDot active={step >= 1} done={step > 1} label="Leads" />
        <Separator />
        <StepDot active={step >= 2} done={step > 2} label="Briefing" />
        <Separator />
        <StepDot active={step >= 3} done={false} label="Revisar e enviar" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Selecionar leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {leads.length === 0
                ? "Cole IDs de oportunidades (sale_id) separados por vírgula ou espaço, ou abra este wizard a partir da página de Leads com itens selecionados."
                : `${leads.length} leads selecionados.`}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="cole sale_ids aqui…"
                value={manualIds}
                onChange={(e) => setManualIds(e.target.value)}
              />
              <Button variant="outline" onClick={handleAddManual} disabled={!manualIds.trim()}>
                Adicionar
              </Button>
            </div>
            {leads.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {leads.slice(0, 24).map((l) => (
                  <Badge key={l.id} variant="outline" className="font-mono text-xs">
                    {l.label ?? l.id.slice(0, 8)}
                  </Badge>
                ))}
                {leads.length > 24 && <Badge variant="secondary">+{leads.length - 24}</Badge>}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={leads.length === 0}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Briefing para a IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tom</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Briefing</Label>
              <Textarea
                rows={6}
                placeholder="Ex: Apresente nosso novo programa de brindes corporativos para o 4º trimestre, mencionando ROI…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {leads.length} e-mails serão gerados, um para cada lead, com gancho personalizado.
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || createJob.isPending}
                loading={createJob.isPending}
                loadingText="Gerando…"
              >
                <Sparkles className="h-4 w-4" /> Gerar com IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>3. Revisar e enviar</CardTitle>
              {job && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Badge variant={STATUS_TONE[job.status] ?? "outline"}>{STATUS_LABEL[job.status] ?? job.status}</Badge>
                  <span>·</span>
                  <span>{counts.total} rascunhos</span>
                  <span>·</span>
                  <span>{counts.approved} aprovados</span>
                  <span>·</span>
                  <span>{counts.sent} enviados</span>
                  {counts.errored > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-destructive">{counts.errored} com erro</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => approveAll(true)} disabled={drafts.length === 0}>
                <CheckCircle2 className="h-4 w-4" /> Aprovar todos
              </Button>
              <div className="flex items-center gap-2 px-2 border rounded-md bg-card">
                <Switch
                  id="optimize-timing"
                  checked={optimizeTiming}
                  onCheckedChange={setOptimizeTiming}
                />
                <Label htmlFor="optimize-timing" className="text-xs cursor-pointer">
                  Distribuir nos horários ótimos
                </Label>
              </div>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!jobId || counts.approved === 0 || sendJob.isPending || scheduleOptimal.isPending}
                loading={sendJob.isPending || scheduleOptimal.isPending}
                loadingText={optimizeTiming ? "Agendando…" : "Enviando…"}
              >
                <Send className="h-4 w-4" />
                {optimizeTiming ? `Agendar (${counts.approved})` : `Enviar aprovados (${counts.approved})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando rascunhos…
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">Nenhum rascunho gerado.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Prévia</TableHead>
                    <TableHead>Personalização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((d) => <BulkDraftRow key={d.id} draft={d} />)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "text-foreground" : ""}`}>
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium border ${
          done ? "bg-primary text-primary-foreground border-primary" : active ? "border-primary text-primary" : "border-muted-foreground/30"
        }`}
      >
        {done ? <CheckCircle2 className="h-3 w-3" /> : ""}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border flex-1" />;
}
