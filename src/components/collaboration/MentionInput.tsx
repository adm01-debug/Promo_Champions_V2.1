import React, { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AtSign, Send } from "lucide-react";
import { CACHE_TIMES } from "@/constants";

interface MentionableUser {
  id: string;
  name: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MentionInput = React.memo(({ value, onChange, onSubmit, placeholder, disabled }: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: users } = useQuery<MentionableUser[]>({
    queryKey: ["mentionable-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("salespeople")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return (data || []) as MentionableUser[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const filtered = useMemo(() => {
    if (!filter) return users || [];
    return (users || []).filter((u) =>
      u.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart || 0;
    setCursorPos(pos);
    onChange(val);

    // Check if we're typing after @
    const textBefore = val.slice(0, pos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setFilter(atMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [onChange]);

  const insertMention = useCallback((user: MentionableUser) => {
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const atIdx = textBefore.lastIndexOf("@");
    const newText = textBefore.slice(0, atIdx) + `@${user.name} ` + textAfter;
    onChange(newText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, [value, cursorPos, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit, showSuggestions]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Digite uma nota... Use @ para mencionar"}
        disabled={disabled}
        className="min-h-[60px] resize-none text-sm pr-10"
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute bottom-2 right-2 h-6 w-6"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        <Send className="h-3.5 w-3.5" />
      </Button>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute bottom-full mb-1 left-0 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => insertMention(u)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <AtSign className="h-3 w-3 text-primary" />
              {u.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
MentionInput.displayName = "MentionInput";

/** Extract @mentions from text */
export function extractMentions(text: string, users: MentionableUser[]): string[] {
  const mentions = text.match(/@[\w\s]+/g) || [];
  return mentions
    .map((m) => m.slice(1).trim())
    .filter((name) => users.some((u) => u.name.toLowerCase() === name.toLowerCase()));
}

/** Render text with highlighted mentions */
export const MentionText = React.memo(({ text }: { text: string }) => {
  const parts = text.split(/(@\w+[\w\s]*?)(?=\s|$)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0 mx-0.5 bg-primary/10 text-primary border-primary/20">
            {part}
          </Badge>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});
MentionText.displayName = "MentionText";
