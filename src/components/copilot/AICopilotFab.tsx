import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAICopilot } from '@/hooks/useAICopilot';
import { useIsMobile } from '@/hooks/useMediaQuery';

export const AICopilotFab: FC = () => {
  const { suggestion, isLoading, isOpen, toggle, dismiss, askCopilot } = useAICopilot();
  const [question, setQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      askCopilot(question.trim());
      setQuestion('');
    }
  };

  return (
    <>
      {/* Suggestion Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              "fixed z-[60] bg-[#0d1117]/80 border border-primary/20 rounded-2xl shadow-[0_0_30px_rgba(var(--primary),0.15)]",
              "backdrop-blur-2xl overflow-hidden",
              isMobile
                ? "bottom-24 right-4 left-4"
                : "bottom-20 right-6 w-80"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary via-primary-glow to-primary flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary),0.4)]">
                  <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse-gentle" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">Circuito Copilot</span>
              </div>
              <Button
                variant="ghost"
                size="icon" aria-label="Fechar"
                className="h-7 w-7"
                onClick={dismiss}
               
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggestion Content */}
            <div className="px-4 py-3 min-h-[60px] max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analisando...</span>
                </div>
              ) : suggestion?.text ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {suggestion.text}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pergunte algo ou aguarde uma sugestão...
                </p>
              )}
            </div>

            {/* Quick Ask Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3">
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5 focus-within:border-primary/40 focus-within:bg-primary/10 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Pergunte ao Copilot..."
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon" aria-label="Enviar"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  disabled={!question.trim() || isLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={toggle}
        className={cn(
          "fixed z-[60] rounded-full shadow-lg transition-colors",
          "bg-gradient-to-br from-primary via-primary-glow to-primary text-primary-foreground",
          "hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] active:scale-95",
          "border border-white/20",
          "flex items-center justify-center",
          isMobile ? "bottom-20 right-4 h-12 w-12" : "bottom-6 right-6 h-12 w-12"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir Copilot IA"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader2 className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Sparkles className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse indicator when has new suggestion */}
        {suggestion && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent animate-pulse" />
        )}
      </motion.button>
    </>
  );
};
