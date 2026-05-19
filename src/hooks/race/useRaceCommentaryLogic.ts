import { useState, useRef, useCallback } from 'react';

export interface CommentaryLine {
  id: string;
  text: string;
  createdAt: number;
}

export function useRaceCommentaryLogic() {
  const [commentary, setCommentary] = useState<CommentaryLine | null>(null);
  const commentaryTimerRef = useRef<number | null>(null);

  const pushCommentary = useCallback((text: string) => {
    if (!text) return;
    const line: CommentaryLine = { id: `${Date.now()}-${Math.random()}`, text, createdAt: Date.now() };
    setCommentary(line);
    if (commentaryTimerRef.current) window.clearTimeout(commentaryTimerRef.current);
    commentaryTimerRef.current = window.setTimeout(() => {
      setCommentary((cur) => (cur?.id === line.id ? null : cur));
    }, 3000);
  }, []);

  return {
    commentary,
    pushCommentary,
  };
}
