import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Plus, Play, Pause, Trophy, CheckCircle2 } from "lucide-react";
import { useCadences } from "@/hooks/useCadences";
import {
  useABTests,
  useABTestResults,
  useCreateABTest,
  useUpdateABTestStatus,
  useDeclareWinner,
} from "@/hooks/cadences/useABTests";

function ABTestResults({ testId }: { testId: string }) {
  const { data: results } = useABTestResults(testId);
  const declareWinner = useDeclareWinner();

  if (!results || results.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">Sem dados ainda — aguarde inscrições.</p>;
  }

  const a = results.find((r) => r.variant === "a");
  const b = results.find((r) => r.variant === "b");
  const winner = a && b ? (a.conversion_rate >= b.conversion_rate ? "a" : "b") : null;

  return (
    <div className="space-y-2 mt-2">
      {results.map((r) => {
        const isWinner = winner === r.variant;
        return (
          <div key={r.variant} className={`rounded-md border p-2 ${isWinner ? "border-status-success/50 bg-status-success/5" : "border-border/40"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Badge variant={r.variant === "a" ? "default" : "secondary"} className="text-[9px]">VARIANT {r.variant.toUpperCase()}</Badge>
                {r.cadence_name}
                {isWinner && <Trophy className="h-3 w-3 text-status-success" />}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px]"
                onClick={() => declareWinner.mutate({ id: testId, winner: r.variant })}
              >
                Declarar vencedor
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">Inscritos</p>
                <p className="font-semibold tabular-nums">{r.enrolled}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completos</p>
                <p className="font-semibold tabular-nums">{r.completed}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reply rate</p>
                <p className="font-semibold tabular-nums text-status-success">{r.reply_rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Conv. rate</p>
                <p className="font-semibold tabular-nums text-primary">{r.conversion_rate}%</p>
              </div>
            </div>
            <Progress value={r.conversion_rate} className="h-1 mt-1.5" />
          </div>
        );
      })}
    </div>
  );
}

export function ABTestDialog() {
  const [open, setOpen] = useState(false);
  const { data: cadences } = useCadences();
  const { data: tests } = useABTests();
  const createTest = useCreateABTest();
  const updateStatus = useUpdateABTestStatus();

  const [form, setForm] = useState({
    name: "",
    description: "",
    hypothesis: "",
    variant_a_id: "",
    variant_b_id: "",
    traffic_split: 50,
  });

  const handleCreate = () => {
    if (!form.name || !form.variant_a_id || !form.variant_b_id) {
      return;
    }
    if (form.variant_a_id === form.variant_b_id) {
      return;
    }
    createTest.mutate(form, {
      onSuccess: () => setForm({ ...form, name: "", description: "", hypothesis: "" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FlaskConical className="h-4 w-4" />
          A/B Tests
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Testes A/B de Cadências
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Create form */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-medium">Novo experimento</h3>
              <Input
                className="h-9"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do teste (ex: Cold email curto vs longo)"
              />
              <Textarea
                className="text-xs"
                rows={2}
                value={form.hypothesis}
                onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
                placeholder="Hipótese: 'A versão curta terá maior reply rate'"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Variante A</Label>
                  <Select value={form.variant_a_id} onValueChange={(v) => setForm({ ...form, variant_a_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Cadência A..." /></SelectTrigger>
                    <SelectContent>
                      {cadences?.filter(c => c.is_active).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Variante B</Label>
                  <Select value={form.variant_b_id} onValueChange={(v) => setForm({ ...form, variant_b_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Cadência B..." /></SelectTrigger>
                    <SelectContent>
                      {cadences?.filter(c => c.is_active && c.id !== form.variant_a_id).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Distribuição de tráfego — A: {form.traffic_split}% / B: {100 - form.traffic_split}%</Label>
                <Slider
                  value={[form.traffic_split]}
                  onValueChange={([v]) => setForm({ ...form, traffic_split: v })}
                  min={10}
                  max={90}
                  step={5}
                  className="mt-2"
                />
              </div>
              <Button size="sm" onClick={handleCreate} disabled={createTest.isPending} className="gap-2">
                <Plus className="h-3.5 w-3.5" /> Criar experimento
              </Button>
            </div>

            {/* Lista */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Experimentos ({tests?.length ?? 0})</h3>
              {tests?.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Nenhum teste criado</p>
              )}
              {tests?.map(test => (
                <div key={test.id} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{test.name}</span>
                        <Badge variant={test.status === "running" ? "default" : "secondary"} className="text-[10px]">
                          {test.status}
                        </Badge>
                        {test.winner_variant && (
                          <Badge variant="outline" className="text-[10px] border-status-success/50 text-status-success gap-1">
                            <Trophy className="h-2.5 w-2.5" /> Vencedor: {test.winner_variant.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {test.hypothesis && <p className="text-xs text-muted-foreground italic mt-1">"{test.hypothesis}"</p>}
                    </div>
                    <div className="flex gap-1">
                      {test.status === "draft" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => updateStatus.mutate({ id: test.id, status: "running" })}>
                          <Play className="h-3 w-3" /> Iniciar
                        </Button>
                      )}
                      {test.status === "running" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => updateStatus.mutate({ id: test.id, status: "paused" })}>
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {(test.status === "running" || test.status === "paused") && !test.winner_variant && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => updateStatus.mutate({ id: test.id, status: "completed" })}>
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ABTestResults testId={test.id} />
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
