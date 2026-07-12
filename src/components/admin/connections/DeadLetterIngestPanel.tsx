import { useCallback, useEffect, useState } from "react";
import { AlertOctagon, RefreshCw, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeadLetterJob {
  id: string;
  idempotency_key: string;
  salesperson_id: string | null;
  attempts: number;
  last_error: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
  next_attempt_at: string;
}

interface DeadLetterJob {
  id: string;
  idempotency_key: string;
  salesperson_id: string | null;
  attempts: number;
  last_error: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
  next_attempt_at: string;
}

export function DeadLetterIngestPanel() {
  const [jobs, setJobs] = useState<DeadLetterJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [replaying, setReplaying] = useState<string | null>(null);
  const [confirmJob, setConfirmJob] = useState<DeadLetterJob | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc(
      "fn_admin_list_dead_letter_ingest_jobs" as never,
      { _limit: 100 } as never,
    );
    if (error) {
      toast.error("Falha ao carregar jobs em dead-letter", { description: error.message });
    } else {
      setJobs((data ?? []) as DeadLetterJob[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replay = useCallback(
    async (id: string) => {
      setReplaying(id);
      const { data, error } = await supabase.rpc(
        "fn_admin_replay_dead_letter_ingest_job" as never,
        { _job_id: id } as never,
      );
      if (error) {
        toast.error("Falha ao reenfileirar", { description: error.message });
      } else if (data) {
        toast.success("Job reenfileirado com sucesso");
        await load();
      } else {
        toast.warning("Job não encontrado ou já reprocessado");
      }
      setReplaying(null);
      setConfirmJob(null);
    },
    [load],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertOctagon className="h-4 w-4 text-destructive" />
            Fila de ingestão — Dead-letter
            <Badge variant="outline" className="ml-2">{jobs.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum job em dead-letter. ✅
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-3 bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono truncate text-foreground">{j.idempotency_key}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tentativas: {j.attempts} · Atualizado {new Date(j.updated_at).toLocaleString("pt-BR")}
                    </p>
                    {j.last_error && (
                      <p className="text-xs text-destructive mt-1 line-clamp-2">{j.last_error}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmJob(j)}
                    disabled={replaying === j.id}
                  >
                    <RotateCw className={`h-3 w-3 mr-1 ${replaying === j.id ? "animate-spin" : ""}`} />
                    Reenfileirar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmJob} onOpenChange={(o) => !o && setConfirmJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenfileirar job em dead-letter?</AlertDialogTitle>
            <AlertDialogDescription>
              O job <span className="font-mono text-xs">{confirmJob?.idempotency_key}</span> será
              reenviado ao worker imediatamente. Tentativas serão zeradas. Confirmar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmJob && void replay(confirmJob.id)}
              disabled={!!replaying}
            >
              Reenfileirar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
