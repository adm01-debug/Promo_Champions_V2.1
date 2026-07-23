import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  drainSSEChunk,
  makeMessageId,
  type AssistantChatMessage,
  type AssistantMode,
} from "./usePersonalAssistantHelpers";

const FUNCTION_PATH = "/functions/v1/personal-assistant-stream";

interface StreamOptions {
  mode: AssistantMode;
  salespersonId: string;
  message?: string;
  history?: Array<Pick<AssistantChatMessage, "role" | "content">>;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

async function streamRequest(opts: StreamOptions): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}${FUNCTION_PATH}`;
  const sess = await supabase.auth.getSession();
  const token = sess.data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(url, {
    method: "POST",
    signal: opts.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: opts.mode,
      salespersonId: opts.salespersonId,
      message: opts.message,
      conversationHistory: opts.history ?? [],
    }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`personal-assistant-stream ${res.status}: ${details.slice(0, 200)}`);
  }
  if (!res.body) throw new Error("empty stream body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const drained = drainSSEChunk(chunk, buffer);
    buffer = drained.buffer;
    if (drained.text) opts.onDelta(drained.text);
  }
  // Flush residual
  if (buffer) {
    const drained = drainSSEChunk("\n", buffer);
    if (drained.text) opts.onDelta(drained.text);
  }
}

export interface UsePersonalAssistantResult {
  briefing: string;
  messages: AssistantChatMessage[];
  isStreaming: boolean;
  isBriefingLoading: boolean;
  error: string | null;
  proactiveNudge: string | null;
  nudgeId: string | null;
  refreshBriefing: () => Promise<void>;
  sendMessage: (msg: string) => Promise<void>;
  checkProactiveNudge: () => Promise<void>;
  dismissNudge: () => void;
  submitNudgeFeedback: (feedback: "accepted" | "dismissed") => Promise<void>;
}

export function usePersonalAssistant(
  salespersonId: string | null | undefined,
): UsePersonalAssistantResult {
  const [briefing, setBriefing] = useState("");
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proactiveNudge, setProactiveNudge] = useState<string | null>(null);
  const [nudgeId, setNudgeId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const refreshBriefing = useCallback(async () => {
    if (!salespersonId) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsBriefingLoading(true);
    setError(null);
    setBriefing("");
    try {
      await streamRequest({
        mode: "briefing",
        salespersonId,
        signal: ctrl.signal,
        onDelta: (t) => setBriefing((prev) => prev + t),
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setIsBriefingLoading(false);
    }
  }, [salespersonId]);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (!salespersonId || !msg.trim()) return;
      const userMsg: AssistantChatMessage = {
        id: makeMessageId(),
        role: "user",
        content: msg.trim(),
        timestamp: Date.now(),
      };
      const assistantMsg: AssistantChatMessage = {
        id: makeMessageId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const historySnapshot = messages.map((m) => ({ role: m.role, content: m.content }));
        await streamRequest({
          mode: "chat",
          salespersonId,
          message: msg.trim(),
          history: historySnapshot,
          signal: ctrl.signal,
          onDelta: (t) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + t } : m)),
            ),
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        setIsStreaming(false);
      }
    },
    [salespersonId, messages],
  );

  const checkProactiveNudge = useCallback(async () => {
    if (!salespersonId) return;
    let acc = "";
    try {
      await streamRequest({
        mode: "proactive_nudge",
        salespersonId,
        onDelta: (t) => {
          acc += t;
        },
      });
    } catch {
      return;
    }
    const cleaned = acc.trim();
    if (cleaned && cleaned !== "NO_NUDGE") {
      setProactiveNudge(cleaned);
      // Persiste nudge para permitir feedback e métricas agregadas.
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error: insErr } = await supabase
          .from("personal_assistant_nudges")
          .insert({ salesperson_id: salespersonId, content: cleaned, feedback: "pending" })
          .select("id")
          .single();
        if (!insErr && data?.id) setNudgeId(data.id);
      } catch {
        // silencioso — nudge segue exibido mesmo sem persistência
      }
    } else {
      setProactiveNudge(null);
      setNudgeId(null);
    }
  }, [salespersonId]);

  const submitNudgeFeedback = useCallback(
    async (feedback: "accepted" | "dismissed") => {
      if (!nudgeId) {
        setProactiveNudge(null);
        return;
      }
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase
          .from("personal_assistant_nudges")
          .update({ feedback })
          .eq("id", nudgeId);
      } catch {
        // no-op
      } finally {
        setProactiveNudge(null);
        setNudgeId(null);
      }
    },
    [nudgeId],
  );

  const dismissNudge = useCallback(() => {
    void submitNudgeFeedback("dismissed");
  }, [submitNudgeFeedback]);

  return {
    briefing,
    messages,
    isStreaming,
    isBriefingLoading,
    error,
    proactiveNudge,
    nudgeId,
    refreshBriefing,
    sendMessage,
    checkProactiveNudge,
    dismissNudge,
    submitNudgeFeedback,
  };
}
