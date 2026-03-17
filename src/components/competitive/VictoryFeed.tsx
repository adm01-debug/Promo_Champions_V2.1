import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, Flame, Rocket, ThumbsUp, MessageCircle, Send, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVictoryFeed } from '@/hooks/useVictoryFeed';

const REACTIONS = ['🔥', '👏', '🚀', '💪', '🏆'];

const eventIcons: Record<string, typeof Trophy> = {
  sale: Trophy,
  achievement: Star,
  record: Rocket,
  streak: Flame,
  challenge: ThumbsUp,
};

const eventColors: Record<string, string> = {
  sale: 'from-emerald-500/20 to-emerald-500/5',
  achievement: 'from-amber-500/20 to-amber-500/5',
  record: 'from-primary/20 to-primary/5',
  streak: 'from-orange-500/20 to-orange-500/5',
  challenge: 'from-accent/20 to-accent/5',
};

interface VictoryFeedProps {
  currentSalespersonId?: string;
}

export const VictoryFeed: FC<VictoryFeedProps> = ({ currentSalespersonId }) => {
  const { feedItems, isLoading, addReaction, addComment } = useVictoryFeed();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const handleReaction = (feedItemId: string, reaction: string) => {
    if (!currentSalespersonId) return;
    addReaction.mutate({ feedItemId, salespersonId: currentSalespersonId, reaction });
  };

  const handleComment = (feedItemId: string) => {
    if (!currentSalespersonId || !commentInputs[feedItemId]?.trim()) return;
    addComment.mutate({
      feedItemId,
      salespersonId: currentSalespersonId,
      content: commentInputs[feedItemId].trim(),
    });
    setCommentInputs(prev => ({ ...prev, [feedItemId]: '' }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!feedItems?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma vitória ainda. Feche um negócio para aparecer aqui! 🚀</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {feedItems.map((item: any, index: number) => {
          const Icon = eventIcons[item.event_type] || Trophy;
          const gradient = eventColors[item.event_type] || eventColors.sale;
          const reactions = item.feed_reactions || [];
          const comments = item.feed_comments || [];
          const isShowingComments = showComments[item.id];

          // Group reactions by emoji
          const reactionCounts = reactions.reduce((acc: Record<string, number>, r: any) => {
            acc[r.reaction] = (acc[r.reaction] || 0) + 1;
            return acc;
          }, {});

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn('border-none shadow-md overflow-hidden')}>
                <div className={cn('bg-gradient-to-r', gradient)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">
                            {(item.salespeople as any)?.name || 'Vendedor'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground mt-0.5">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                        {item.value > 0 && (
                          <p className="text-lg font-bold text-primary mt-1">
                            R$ {Number(item.value).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {REACTIONS.map(emoji => {
                        const count = reactionCounts[emoji] || 0;
                        const hasReacted = reactions.some(
                          (r: any) => r.reaction === emoji && r.salesperson_id === currentSalespersonId
                        );
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(item.id, emoji)}
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
                              'hover:scale-110 active:scale-95',
                              hasReacted
                                ? 'bg-primary/20 border border-primary/30'
                                : 'bg-background/50 border border-border/30 hover:bg-background/80'
                            )}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-muted-foreground">{count}</span>}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setShowComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-background/50 border border-border/30 hover:bg-background/80 ml-auto"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {comments.length > 0 && <span>{comments.length}</span>}
                      </button>
                    </div>

                    {/* Comments */}
                    <AnimatePresence>
                      {isShowingComments && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-2 border-t border-border/20 pt-3">
                            {comments.map((c: any) => (
                              <div key={c.id} className="flex gap-2 text-xs">
                                <span className="font-semibold text-foreground">{(c.salespeople as any)?.name || '?'}:</span>
                                <span className="text-muted-foreground">{c.content}</span>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commentInputs[item.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment(item.id)}
                                placeholder="Comentar..."
                                className="flex-1 text-xs bg-background/50 rounded-lg px-3 py-1.5 border border-border/30 outline-none"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleComment(item.id)}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
