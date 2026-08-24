import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Plus, Trash2 } from "lucide-react";
import { useUpdateCoachingSession, type CoachingSession } from "@/hooks/coaching/useCoachingSessions";
import { cn } from "@/lib/utils";

interface Props {
  session: CoachingSession;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SessionNotesEditor({ session, open, onOpenChange }: Props) {
  const [notes, setNotes] = useState(session.notes ?? "");
  const [actions, setActions] = useState(session.action_items ?? []);
  const [rating, setRating] = useState(session.outcome_rating ?? 0);
  const [newAction, setNewAction] = useState("");

  const update = useUpdateCoachingSession();

  const addAction = () => {
    if (!newAction.trim()) return;
    setActions([...actions, { text: newAction.trim(), done: false }]);
    setNewAction("");
  };

  const toggleAction = (idx: number) => {
    setActions(actions.map((a, i) => (i === idx ? { ...a, done: !a.done } : a)));
  };

  const removeAction = (idx: number) => setActions(actions.filter((_, i) => i !== idx));

  const handleSave = async (markCompleted: boolean) => {
    await update.mutateAsync({
      id: session.id,
      notes,
      action_items: actions,
      outcome_rating: rating || undefined,
      ...(markCompleted ? { status: "completed", completed_at: new Date().toISOString() } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anotações da sessão</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Resumo</Label>
            <Textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="O que foi discutido, descobertas, observações..." />
          </div>

          <div>
            <Label>Action items</Label>
            <div className="space-y-2 mt-2">
              {actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/40">
                  <input type="checkbox" checked={!!a.done} onChange={() => toggleAction(i)} className="h-4 w-4" />
                  <span className={cn("flex-1 text-sm", a.done && "line-through text-muted-foreground")}>{a.text}</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeAction(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Nova ação..." onKeyDown={(e) => e.key === "Enter" && addAction()} />
                <Button variant="outline" size="icon" onClick={addAction}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Avaliação da sessão</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={cn("h-6 w-6 transition-colors", n <= rating ? "fill-warning text-warning" : "text-muted-foreground/40")} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} loading={update.isPending}>Salvar</Button>
          <Button variant="default" onClick={() => handleSave(true)} loading={update.isPending}>Marcar como concluída</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
