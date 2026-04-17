import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUGGESTED_QUESTIONS } from "./nlqHelpers";

interface NLQInputProps {
  loading: boolean;
  onAsk: (question: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function NLQInput({ loading, onAsk, autoFocus, compact }: NLQInputProps) {
  const [value, setValue] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || loading) return;
    onAsk(value.trim());
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="relative">
        <Textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Pergunte algo: "Quanto vendi em março?"'
          className={compact ? "min-h-[64px] pr-14 resize-none text-sm" : "min-h-[96px] pr-14 resize-none text-base"}
          maxLength={1000}
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          variant="glow"
          className="absolute right-2 bottom-2"
          disabled={loading || !value.trim()}
          aria-label="Enviar pergunta"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1 text-xs">
          <Sparkles className="h-3 w-3" /> Sugestões
        </Badge>
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => onAsk(q)}
            className="text-xs px-2.5 py-1 rounded-full border border-border/60 bg-background/60 hover:bg-accent/10 hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
