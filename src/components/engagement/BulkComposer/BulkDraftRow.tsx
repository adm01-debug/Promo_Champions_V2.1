import { useState } from "react";
import { Check, AlertTriangle, Mail, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
import { type BulkDraft, useUpdateDraft } from "@/hooks/engagement/useBulkComposer";
import { truncate, isValidEmail } from "./bulkComposerHelpers";

interface Props {
  draft: BulkDraft;
}

export function BulkDraftRow({ draft }: Props) {
  const update = useUpdateDraft();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [email, setEmail] = useState(draft.recipient_email ?? "");

  const validEmail = isValidEmail(email);
  const sent = !!draft.sent_at;

  return (
    <TableRow className={sent ? "opacity-60" : ""}>
      <TableCell className="w-12">
        <Checkbox
          checked={draft.approved}
          disabled={sent || !validEmail}
          onCheckedChange={(v) => update.mutate({ id: draft.id, patch: { approved: !!v } })}
          aria-label="Aprovar para envio"
        />
      </TableCell>
      <TableCell className="min-w-[180px]">
        <div className="font-medium text-sm">{draft.recipient_name ?? "—"}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {draft.recipient_email ?? <span className="text-destructive">sem e-mail</span>}
        </div>
      </TableCell>
      <TableCell className="min-w-[260px]">
        <div className="font-medium text-sm">{truncate(draft.subject, 80)}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{truncate(draft.body, 220)}</div>
      </TableCell>
      <TableCell className="min-w-[200px]">
        {draft.personalization_notes ? (
          <Badge variant="secondary" className="font-normal whitespace-normal text-left">
            {truncate(draft.personalization_notes, 110)}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-32">
        {sent ? (
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" /> Enviado
          </Badge>
        ) : draft.error ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Erro
          </Badge>
        ) : (
          <Badge variant="outline">Pendente</Badge>
        )}
      </TableCell>
      <TableCell className="w-20 text-right">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={sent}>
              <Pencil className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] space-y-3" align="end">
            <div className="space-y-1">
              <label className="text-xs font-medium">E-mail destinatário</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} error={!!email && !validEmail} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Assunto</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Corpo</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  update.mutate(
                    { id: draft.id, patch: { subject, body, recipient_email: email || null } as any },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
              >
                Salvar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
