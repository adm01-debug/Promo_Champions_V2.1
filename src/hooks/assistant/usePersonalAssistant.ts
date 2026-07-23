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
  // eslint-disable-next-line no-constant-condition
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
  refreshBriefing: () => Promise<void>;
  sendMessage: (msg: string) => Promise<void>;
  checkProactiveNudge: () => Promise<void>;
  dismissNudge: () => void;
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
    setProactiveNudge(cleaned && cleaned !== "NO_NUDGE" ? cleaned : null);
  }, [salespersonId]);

  const dismissNudge = useCallback(() => setProactiveNudge(null), []);

  return {
    briefing,
    messages,
    isStreaming,
    isBriefingLoading,
    error,
    proactiveNudge,
    refreshBriefing,
    sendMessage,
    checkProactiveNudge,
    dismissNudge,
  };
}
