import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCoachingSession, useSessionPrep } from "@/hooks/coaching/useCoachingSessions";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SKILL_LABELS } from "./sessionPlannerHelpers";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  salespersonId: string;
  salespersonName: string;
}

export function SessionScheduleDialog({ open, onOpenChange, salespersonId, salespersonName }: Props) {
  const [scheduledAt, setScheduledAt] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setMinutes(0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(30);
  const [focusSkills, setFocusSkills] = useState<string[]>([]);

  const { data: prep, isLoading: prepLoading } = useSessionPrep(open ? salespersonId : null);
  const create = useCreateCoachingSession();

  const toggleSkill = (skill: string) => {
    setFocusSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSubmit = async () => {
    await create.mutateAsync({
      salesperson_id: salespersonId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_min: duration,
      focus_skills: focusSkills,
      agenda: prep ? { suggested: prep.ai_talking_points, gaps: prep.top_gaps } : {},
    });
    onOpenChange(false);
    setFocusSkills([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agendar sessão 1:1 — {salespersonName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="when">Data e hora</Label>
              <Input id="when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dur">Duração (min)</Label>
              <Input id="dur" type="number" min={15} max={240} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Habilidades em foco {prepLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(prep?.suggested_focus_skills ?? Object.keys(SKILL_LABELS).slice(0, 5)).map((skill) => (
                <Badge
                  key={skill}
                  variant={focusSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {SKILL_LABELS[skill] ?? skill}
                </Badge>
              ))}
            </div>
            {prep?.top_gaps && prep.top_gaps.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                IA sugere: {prep.top_gaps.map((g) => `${g.label} (${g.score})`).join(", ")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={create.isPending} loadingText="Agendando...">
            Agendar sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
