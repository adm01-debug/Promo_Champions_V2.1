import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, Flame, Rocket, ThumbsUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useVictoryFeed } from '@/hooks/useVictoryFeed';
import { VictoryFeedItem } from './VictoryFeedItem';
import { PostVictoryForm } from './PostVictoryForm';

const eventIcons: Record<string, typeof Trophy> = {
  sale: Trophy,
  achievement: Star,
  record: Rocket,
  streak: Flame,
  challenge: ThumbsUp,
};

const eventColors: Record<string, string> = {
  sale: 'from-success/20 to-success/5',
  achievement: 'from-rank-gold/20 to-rank-gold/5',
  record: 'from-primary/20 to-primary/5',
  streak: 'from-streak/20 to-streak/5',
  challenge: 'from-accent/20 to-accent/5',
};

interface VictoryFeedProps {
  currentSalespersonId?: string;
}

const VictoryFeedComponent: FC<VictoryFeedProps> = ({ currentSalespersonId }) => {
  const { feedItems, isLoading, addReaction, addComment, postVictory } = useVictoryFeed();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Post form */}
      {currentSalespersonId && (
        <PostVictoryForm
          salespersonId={currentSalespersonId}
          onPost={(data) => postVictory.mutate({ salesperson_id: currentSalespersonId, ...data })}
          isPosting={postVictory.isPending}
        />
      )}

      {/* Feed */}
      {!feedItems?.length ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma vitória ainda. Feche um negócio para aparecer aqui! 🚀</p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {feedItems.map((item: Record<string, any>, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <VictoryFeedItem
                item={item}
                currentSalespersonId={currentSalespersonId}
                eventIcons={eventIcons}
                eventColors={eventColors}
                onReaction={(feedItemId, reaction) => {
                  if (!currentSalespersonId) return;
                  addReaction.mutate({ feedItemId, salespersonId: currentSalespersonId, reaction });
                }}
                onComment={(feedItemId, content) => {
                  if (!currentSalespersonId) return;
                  addComment.mutate({ feedItemId, salespersonId: currentSalespersonId, content });
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export const VictoryFeed = React.memo(VictoryFeedComponent);
