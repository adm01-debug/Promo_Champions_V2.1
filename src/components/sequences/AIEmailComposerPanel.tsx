import { useState } from "react";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GOAL_OPTIONS,
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  splitWithVariables,
  type EmailGoal,
  type EmailTone,
  type EmailLength,
  type EmailLanguage,
} from "./emailComposerHelpers";
import { useGenerateEmail } from "@/hooks/sequences/useAIEmailComposer";

interface Props {
  onAccept: (subject: string, body: string) => void;
  onClose: () => void;
}

export function AIEmailComposerPanel({ onAccept, onClose }: Props) {
  const [goal, setGoal] = useState<EmailGoal>("follow_up");
  const [tone, setTone] = useState<EmailTone>("consultivo");
  const [length, setLength] = useState<EmailLength>("medium");
  const [language, setLanguage] = useState<EmailLanguage>("pt-BR");
  const [instructions, setInstructions] = useState("");
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  const generate = useGenerateEmail();

  const run = async () => {
    const result = await generate.mutateAsync({
      goal,
      tone,
      length,
      language,
      custom_instructions: instructions || undefined,
    });
    setDraft({ subject: result.subject, body: result.body });
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Compor com IA</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Objetivo</Label>
          <Select value={goal} onValueChange={(v) => setGoal(v as EmailGoal)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GOAL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tom</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tamanho</Label>
          <Select value={length} onValueChange={(v) => setLength(v as EmailLength)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LENGTH_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Idioma</Label>
          <Select value={language} onValueChange={(v) => setLanguage(v as EmailLanguage)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (BR)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Instruções extras (opcional)</Label>
        <Textarea
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ex: mencionar caso de sucesso da Acme; evitar jargão técnico..."
          className="text-sm"
        />
      </div>

      {generate.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : draft ? (
        <div className="space-y-2 rounded-md border bg-background p-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Assunto</div>
            <div className="text-sm font-medium">
              {splitWithVariables(draft.subject).map((p, i) =>
                p.isVar ? (
                  <span key={i} className="rounded bg-primary/15 px-1 font-mono text-primary">{p.text}</span>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Corpo</div>
            <div className="whitespace-pre-wrap text-sm">
              {splitWithVariables(draft.body).map((p, i) =>
                p.isVar ? (
                  <span key={i} className="rounded bg-primary/15 px-1 font-mono text-primary">{p.text}</span>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        {draft && (
          <>
            <Button variant="outline" size="sm" onClick={run} disabled={generate.isPending}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAccept(draft.subject, draft.body);
                onClose();
              }}
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Usar este
            </Button>
          </>
        )}
        {!draft && (
          <Button size="sm" onClick={run} disabled={generate.isPending}>
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Gerar com IA
          </Button>
        )}
      </div>
    </div>
  );
}
