import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useInsightComments } from "@/hooks/win-loss/useInsightComments";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Props {
  insightId: string;
}

const initials = (name?: string | null) =>
  (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function InsightCommentsThread({ insightId }: Props) {
  const { comments, isLoading, add, isAdding, remove } = useInsightComments(insightId);
  const [text, setText] = useState("");
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      await add(text);
      setText("");
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MessageSquare className="h-3 w-3" />
        Conversa ({comments.length})
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Sem comentários ainda. Inicie a conversa.</p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-xs group">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={c.author_avatar ?? undefined} alt={c.author_name ?? ""} />
                <AvatarFallback className="text-[10px]">{initials(c.author_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">{c.body}</p>
              </div>
              {uid === c.author_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => remove(c.id)}
                  aria-label="Apagar comentário"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Adicione uma observação…"
          className="min-h-[40px] text-xs resize-none"
          rows={1}
          maxLength={2000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <Button size="sm" onClick={() => void handleSubmit()} disabled={isAdding || !text.trim()}>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
