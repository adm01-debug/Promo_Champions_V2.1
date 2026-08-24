import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Trophy, Sparkles } from "lucide-react";
import {
  useStepVariants,
  useStepVariantPerformance,
  useUpsertStepVariant,
  useDeclareStepWinner,
  type StepVariant,
} from "@/hooks/sequences/useStepVariants";
import { analyzeWinner } from "./abTestHelpers";
import { AIEmailComposerPanel } from "./AIEmailComposerPanel";

interface Props {
  stepId: string;
  seedSubject: string;
  seedBody: string;
}

interface DraftVariant {
  id?: string;
  subject: string;
  body: string;
  traffic_weight: number;
}

const emptyDraft = (subject: string, body: string, weight: number): DraftVariant => ({
  subject,
  body,
  traffic_weight: weight,
});

export function StepVariantsManager({ stepId, seedSubject, seedBody }: Props) {
  const { data: variants } = useStepVariants(stepId);
  const { data: perf } = useStepVariantPerformance(stepId);
  const upsert = useUpsertStepVariant();
  const declareWinner = useDeclareStepWinner();

  const [drafts, setDrafts] = useState<{ A: DraftVariant; B: DraftVariant }>(() => ({
    A: emptyDraft(seedSubject, seedBody, 50),
    B: emptyDraft(seedSubject, seedBody, 50),
  }));
  const [aiFor, setAiFor] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    if (!variants) return;
    const findV = (label: "A" | "B"): StepVariant | undefined =>
      variants.find((v) => v.label === label);
    const a = findV("A");
    const b = findV("B");
    setDrafts({
      A: a
        ? { id: a.id, subject: a.subject ?? "", body: a.body ?? "", traffic_weight: a.traffic_weight }
        : emptyDraft(seedSubject, seedBody, 50),
      B: b
        ? { id: b.id, subject: b.subject ?? "", body: b.body ?? "", traffic_weight: b.traffic_weight }
        : emptyDraft(seedSubject, seedBody, 50),
    });
  }, [variants, seedSubject, seedBody]);

  const analysis = useMemo(() => analyzeWinner(perf ?? []), [perf]);

  const updateDraft = (label: "A" | "B", patch: Partial<DraftVariant>) => {
    setDrafts((d) => ({ ...d, [label]: { ...d[label], ...patch } }));
  };

  const handleWeightChange = (label: "A" | "B", val: number) => {
    const other = label === "A" ? "B" : "A";
    setDrafts((d) => ({
      ...d,
      [label]: { ...d[label], traffic_weight: val },
      [other]: { ...d[other], traffic_weight: 100 - val },
    }));
  };

  const saveBoth = async () => {
    await Promise.all([
      upsert.mutateAsync({ step_id: stepId, label: "A", ...drafts.A }),
      upsert.mutateAsync({ step_id: stepId, label: "B", ...drafts.B }),
    ]);
  };

  const renderCard = (label: "A" | "B") => {
    const draft = drafts[label];
    const stat = perf?.find((p) => p.label === label);
    const isWinner = analysis.winnerLabel === label;
    return (
      <Card className={`p-4 space-y-3 ${isWinner ? "border-primary border-2" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isWinner ? "default" : "outline"}>Variante {label}</Badge>
            {isWinner && (
              <Badge className="gap-1">
                <Trophy className="h-3 w-3" />
                Vencedora
              </Badge>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-primary"
            onClick={() => setAiFor(aiFor === label ? null : label)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            IA
          </Button>
        </div>
        <div>
          <Label className="text-xs">Assunto</Label>
          <Input
            value={draft.subject}
            onChange={(e) => updateDraft(label, { subject: e.target.value })}
            placeholder="Assunto"
          />
        </div>
        <div>
          <Label className="text-xs">Corpo</Label>
          <Textarea
            rows={5}
            value={draft.body}
            onChange={(e) => updateDraft(label, { body: e.target.value })}
            placeholder="Mensagem..."
          />
        </div>
        <div>
          <Label className="text-xs">Tráfego: {draft.traffic_weight}%</Label>
          <Slider
            value={[draft.traffic_weight]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => handleWeightChange(label, v[0])}
          />
        </div>
        {stat && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-2">
            <span>📤 {stat.sent} envios</span>
            <span>💬 {stat.replied} respostas</span>
            <span className="font-semibold text-foreground">{stat.reply_rate}% reply</span>
          </div>
        )}
        {aiFor === label && (
          <AIEmailComposerPanel
            onAccept={(s, b) => {
              updateDraft(label, { subject: s, body: b });
              setAiFor(null);
            }}
            onClose={() => setAiFor(null)}
          />
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderCard("A")}
        {renderCard("B")}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md p-2">
        <span>{analysis.reason}</span>
        {analysis.significant && analysis.winnerLabel && (
          <Button
            size="sm"
            onClick={() =>
              declareWinner.mutate({ stepId, label: analysis.winnerLabel as "A" | "B" })
            }
            loading={declareWinner.isPending}
          >
            <Trophy className="h-3.5 w-3.5 mr-1" />
            Promover {analysis.winnerLabel}
          </Button>
        )}
      </div>
      <Button onClick={saveBoth} loading={upsert.isPending} className="w-full">
        Salvar variantes
      </Button>
    </div>
  );
}
