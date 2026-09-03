import { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, Loader2, X, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalAssistant } from '@/hooks/assistant/usePersonalAssistant';

const NUDGE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Drawer lateral proativo — substitui o antigo AICopilotFab.
 * Dispara briefing ao abrir; a cada 5 min chama modo proactive_nudge silenciosamente.
 */
export const PersonalAssistantDrawer: FC = () => {
  const { salesperson } = useAuth();
  const salespersonId = salesperson?.id ?? null;
  const {
    briefing,
    messages,
    isBriefingLoading,
    isStreaming,
    error,
    proactiveNudge,
    refreshBriefing,
    sendMessage,
    checkProactiveNudge,
    dismissNudge,
    submitNudgeFeedback,
  } = usePersonalAssistant(salespersonId);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [briefingLoadedOnce, setBriefingLoadedOnce] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && salespersonId && !briefingLoadedOnce) {
      void refreshBriefing();
      setBriefingLoadedOnce(true);
    }
  }, [open, salespersonId, briefingLoadedOnce, refreshBriefing]);

  useEffect(() => {
    if (!salespersonId) return;
    const timer = setInterval(() => void checkProactiveNudge(), NUDGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [salespersonId, checkProactiveNudge]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, briefing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    void sendMessage(msg);
  };

  if (!salespersonId) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button
          className={cn(
            'fixed z-[60] bottom-6 right-6 h-12 w-12 rounded-full',
            'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground',
            'shadow-lg hover:shadow-xl border border-primary-foreground/10',
            'flex items-center justify-center'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Abrir Assistente Pessoal"
        >
          <Sparkles className="h-5 w-5" />
          {proactiveNudge && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
          )}
        </motion.button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b bg-primary/5">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Assistente Pessoal
            <Badge
              variant="outline"
              className="ml-auto text-[10px] border-primary/30 text-primary"
            >
              IA · {salesperson?.name?.split(' ')[0] ?? ''}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <AnimatePresence>
          {proactiveNudge && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-3 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="flex-1">{proactiveNudge}</span>
                <button
                  aria-label="Dispensar"
                  onClick={dismissNudge}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-destructive/20">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Foi útil?
                </span>
                <button
                  onClick={() => void submitNudgeFeedback('accepted')}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  aria-label="Nudge foi útil"
                >
                  <ThumbsUp className="h-3 w-3" /> Sim
                </button>
                <button
                  onClick={() => void submitNudgeFeedback('dismissed')}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
                  aria-label="Nudge não foi útil"
                >
                  <ThumbsDown className="h-3 w-3" /> Não
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        { }
        <ScrollArea
          className="flex-1 px-4 py-3"
          ref={scrollRef as unknown as React.Ref<HTMLDivElement>}
        >
          <section className="mb-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Briefing do dia
            </div>
            {isBriefingLoading && !briefing ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Preparando…
              </div>
            ) : error && !briefing ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                <ReactMarkdown>{briefing || '_Sem briefing ainda._'}</ReactMarkdown>
              </div>
            )}
          </section>

          {messages.length > 0 && (
            <section className="space-y-3 border-t pt-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary/10 ml-6'
                      : 'bg-muted/50 mr-6 prose prose-sm dark:prose-invert max-w-none'
                  )}
                >
                  {m.role === 'user' ? (
                    m.content
                  ) : (
                    <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
                  )}
                </div>
              ))}
            </section>
          )}
        </ScrollArea>

        <form onSubmit={submit} className="p-3 border-t bg-card">
          <div className="flex items-center gap-2 bg-muted/40 border rounded-xl px-3 py-2 focus-within:border-primary/50">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte ao seu assistente…"
              className="flex-1 text-sm bg-transparent outline-none"
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isStreaming}
              aria-label="Enviar"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default PersonalAssistantDrawer;
