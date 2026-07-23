import { FC, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/atoms/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalAssistant } from "@/hooks/assistant/usePersonalAssistant";
import { RunRateProjectionCard } from "@/components/vendedor/RunRateProjectionCard";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Quais deals eu deveria priorizar hoje?",
  "Como retomar um cliente parado há mais de 10 dias?",
  "Me dê uma dica de fechamento baseada no meu histórico.",
  "Qual objeção estou perdendo mais e como responder?",
];

const HubInner: FC = () => {
  const { salesperson } = useAuth();
  const salespersonId = salesperson?.id ?? null;
  const {
    briefing,
    messages,
    isBriefingLoading,
    isStreaming,
    refreshBriefing,
    sendMessage,
    error,
  } = usePersonalAssistant(salespersonId);

  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (salespersonId) void refreshBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salespersonId]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    void sendMessage(msg);
  };

  const displayName = salesperson?.name?.split(" ")[0] ?? "Vendedor";

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Helmet>
        <title>Meu Assistente · Coach + Secretário IA</title>
        <meta
          name="description"
          content="Assistente pessoal com briefing do dia, priorização de deals e coach de vendas dedicado ao vendedor."
        />
      </Helmet>

      <div className="max-w-[1400px] mx-auto space-y-4">
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">Meu Assistente</h1>
            <p className="text-xs text-muted-foreground">
              Secretário executivo + Coach de vendas · {displayName}
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            IA em streaming
          </Badge>
          <Button size="sm" variant="outline" onClick={() => void refreshBriefing()} disabled={isBriefingLoading} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", isBriefingLoading && "animate-spin")} />
            Atualizar
          </Button>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna esquerda — Briefing + Run Rate */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Briefing do dia
              </div>
              {isBriefingLoading && !briefing ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-10/12" />
                  <Skeleton className="h-3 w-9/12" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-8/12" />
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">Não consegui gerar o briefing. Tente novamente.</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{briefing || "_Aguardando…_"}</ReactMarkdown>
                </div>
              )}
            </Card>

            {salespersonId && <RunRateProjectionCard salespersonId={salespersonId} />}
          </div>

          {/* Coluna central — Sugestões / prioridades derivadas do briefing */}
          <div className="lg:col-span-3">
            <Card className="p-4 h-full">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Perguntas sugeridas
              </div>
              <div className="space-y-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    disabled={isStreaming}
                    className="w-full text-left text-sm p-2 rounded-md bg-muted/40 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Coluna direita — Chat */}
          <div className="lg:col-span-5">
            <Card className="p-0 h-[600px] flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Conversa com o Coach</span>
              </div>

              <ScrollArea className="flex-1 px-4 py-3" ref={chatRef as unknown as React.Ref<HTMLDivElement>}>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    Pergunte algo ao seu coach. Ele já sabe suas metas, deals e gaps.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          m.role === "user"
                            ? "bg-primary/10 ml-8"
                            : "bg-muted/50 mr-8 prose prose-sm dark:prose-invert max-w-none",
                        )}
                      >
                        {m.role === "user" ? m.content : <ReactMarkdown>{m.content || "…"}</ReactMarkdown>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <form onSubmit={submit} className="p-3 border-t bg-card">
                <div className="flex items-center gap-2 bg-muted/40 border rounded-xl px-3 py-2 focus-within:border-primary/50">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte algo…"
                    className="flex-1 text-sm bg-transparent outline-none"
                    disabled={isStreaming}
                  />
                  <Button type="submit" size="icon" variant="ghost" disabled={!input.trim() || isStreaming} aria-label="Enviar">
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MeuAssistente() {
  return (
    <ProtectedRoute>
      <PageTransition>
        <HubInner />
      </PageTransition>
    </ProtectedRoute>
  );
}
