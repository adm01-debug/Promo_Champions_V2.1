import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { NLQInput } from "./NLQInput";
import { NLQAnswerCard } from "./NLQAnswerCard";
import { useNLQ } from "@/hooks/nlq/useNLQ";

export function DashboardNLQWidget() {
  const [open, setOpen] = useState(false);
  const { loading, response, ask } = useNLQ();

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Pergunte à IA</div>
              <div className="text-xs text-muted-foreground">Ex.: "Quanto vendi em março?"</div>
            </div>
          </div>
          <Button variant="glow" size="sm" onClick={() => setOpen(true)}>Perguntar</Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Pergunte qualquer coisa sobre seus dados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <NLQInput loading={loading} onAsk={ask} autoFocus compact />
            {response && <NLQAnswerCard response={response} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
