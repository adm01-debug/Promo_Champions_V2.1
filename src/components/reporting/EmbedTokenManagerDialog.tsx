import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useReportEmbedTokens, useCreateReportEmbedToken, useRevokeReportEmbedToken, useDeleteReportEmbedToken } from "@/hooks/reporting/useReportEmbedTokens";
import { buildEmbedUrl, buildIframeSnippet, tokenStatus } from "./embedHelpers";
import { Copy, Plus, Eye, Trash2, Ban, Link2, Code } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportId: string;
}

export function EmbedTokenManagerDialog({ open, onOpenChange, reportId }: Props) {
  const tokens = useReportEmbedTokens(reportId);
  const create = useCreateReportEmbedToken();
  const revoke = useRevokeReportEmbedToken();
  const remove = useDeleteReportEmbedToken();

  const [expiresAt, setExpiresAt] = useState("");
  const [originsInput, setOriginsInput] = useState("");

  const handleCreate = useCallback(async () => {
    const origins = originsInput.split(",").map((s) => s.trim()).filter(Boolean);
    await create.mutateAsync({
      report_id: reportId,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      allowed_origins: origins,
    });
    setExpiresAt("");
    setOriginsInput("");
  }, [create, reportId, expiresAt, originsInput]);

  const copy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass">
        <DialogHeader>
          <DialogTitle className="font-display">Compartilhar / Embutir relatório</DialogTitle>
          <DialogDescription>
            Gere tokens públicos para embutir este relatório em sites externos via iframe ou link direto.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 border-border/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Expira em (opcional)</Label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">Origens permitidas (CSV)</Label>
              <Input placeholder="https://site.com, https://outro.com" value={originsInput} onChange={(e) => setOriginsInput(e.target.value)} className="h-9 mt-1" />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={create.isPending} className="gap-2 w-full">
            <Plus className="h-4 w-4" /> Gerar novo token
          </Button>
        </Card>

        <Separator />

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-2">
            {tokens.isLoading && <p className="text-xs text-muted-foreground">Carregando…</p>}
            {tokens.data?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum token criado ainda.</p>
            )}
            {tokens.data?.map((t) => {
              const status = tokenStatus(t);
              const url = buildEmbedUrl(t.token);
              const iframe = buildIframeSnippet(t.token);
              return (
                <Card key={t.id} className="p-3 border-border/40 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={status.tone === "success" ? "default" : status.tone === "destructive" ? "destructive" : "secondary"}>
                        {status.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3 w-3" /> {t.view_count}
                      </span>
                      {t.expires_at && (
                        <span className="text-muted-foreground">
                          até {format(new Date(t.expires_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!t.revoked && (
                        <Button size="sm" variant="ghost" onClick={() => revoke.mutate({ id: t.id, report_id: reportId })} className="h-7 px-2 gap-1 text-xs">
                          <Ban className="h-3 w-3" /> Revogar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate({ id: t.id, report_id: reportId })} className="h-7 px-2 text-xs text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Button size="sm" variant="outline" onClick={() => copy(url, "Link")} className="w-full justify-start gap-2 h-8 text-xs font-mono">
                      <Link2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{url}</span>
                      <Copy className="h-3 w-3 ml-auto shrink-0" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copy(iframe, "Snippet iframe")} className="w-full justify-start gap-2 h-8 text-xs">
                      <Code className="h-3 w-3 shrink-0" /> Copiar snippet iframe
                      <Copy className="h-3 w-3 ml-auto shrink-0" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
