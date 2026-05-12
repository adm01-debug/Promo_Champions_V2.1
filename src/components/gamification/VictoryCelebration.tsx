import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, PartyPopper, Zap, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function VictoryCelebration() {
  const { salesperson } = useAuth();
  const [activeVictory, setActiveVictory] = useState<any>(null);

  useEffect(() => {
    if (!salesperson?.id) return;

    const channel = supabase
      .channel('victory-celebration')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'victory_feed',
          filter: `salesperson_id=eq.${salesperson.id}`,
        },
        (payload) => {
          const newItem = payload.new;
          setActiveVictory(newItem);
          
          // Trigger confetti
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500'],
          });
          
          // Auto close after 8 seconds
          setTimeout(() => {
            setActiveVictory(null);
          }, 8000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salesperson?.id]);

  if (!activeVictory) return null;

  const icons: Record<string, any> = {
    sale: Trophy,
    achievement: Star,
    streak: PartyPopper,
    level_up: Zap,
  };

  const Icon = icons[activeVictory.event_type] || Trophy;

  return (
    <AnimatePresence>
      {activeVictory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
            onClick={() => setActiveVictory(null)}
          />
          
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-card border-2 border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.3)] rounded-3xl p-8 text-center pointer-events-auto overflow-hidden group"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent animate-pulse" />
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              onClick={() => setActiveVictory(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 mb-6 border-2 border-primary/30 relative z-10 shadow-2xl"
            >
              <Icon className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
            </motion.div>

            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter gradient-text">
                {activeVictory.title}
              </h2>
              <p className="text-lg font-medium text-foreground">
                Parabéns, {salesperson.name}!
              </p>
              <p className="text-sm text-muted-foreground">
                {activeVictory.description}
              </p>
              
              {activeVictory.value > 0 && (
                <div className="mt-4 inline-block px-6 py-2 rounded-full bg-status-success/10 border border-status-success/30 text-status-success font-black italic text-lg shadow-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeVictory.value)}
                </div>
              )}
            </div>

            <Button 
              className="mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest h-12 rounded-2xl shadow-xl shadow-primary/20 relative z-10"
              onClick={() => setActiveVictory(null)}
            >
              Uau! Vamos para a próxima!
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
