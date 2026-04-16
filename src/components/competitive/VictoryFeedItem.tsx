import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, MessageCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const REACTIONS = ['🔥', '👏', '🚀', '💪', '🏆'];

interface VictoryFeedItemProps {
  item: Record<string, any>;
  currentSalespersonId?: string;
  eventIcons: Record<string, typeof Trophy>;
  eventColors: Record<string, string>;
  onReaction: (feedItemId: string, reaction: string) => void;
  onComment: (feedItemId: string, content: string) => void;
}

export const VictoryFeedItem: FC<VictoryFeedItemProps> = React.memo(({
  item, currentSalespersonId, eventIcons, eventColors, onReaction, onComment
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);

  const Icon = eventIcons[item.event_type] || Trophy;
  const gradient = eventColors[item.event_type] || eventColors.sale || 'from-success/20 to-success/5';
  const reactions = item.feed_reactions || [];
  const comments = item.feed_comments || [];

  const reactionCounts = reactions.reduce((acc: Record<string, number>, r: { reaction: string }) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {});

  const handleComment = () => {
    if (!commentInput.trim()) return;
    onComment(item.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <div className={cn('bg-gradient-to-r', gradient)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {(item.salespeople as Record<string, string> | null)?.name || 'Vendedor'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="font-semibold text-foreground mt-0.5">{item.title}</p>
              {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
              {item.value > 0 && (
                <p className="text-lg font-bold text-primary mt-1">R$ {Number(item.value).toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {REACTIONS.map(emoji => {
              const count = reactionCounts[emoji] || 0;
              const hasReacted = reactions.some(
                (r: { reaction: string; salesperson_id: string }) => r.reaction === emoji && r.salesperson_id === currentSalespersonId
              );
              return (
                <button
                  key={emoji}
                  onClick={() => onReaction(item.id, emoji)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:scale-110 active:scale-95',
                    hasReacted ? 'bg-primary/20 border border-primary/30' : 'bg-background/50 border border-border/30 hover:bg-background/80'
                  )}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span className="text-muted-foreground">{count}</span>}
                </button>
              );
            })}
            <button
              onClick={() => setShowComments(prev => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-background/50 border border-border/30 hover:bg-background/80 ml-auto"
            >
              <MessageCircle className="h-3 w-3" />
              {comments.length > 0 && <span>{comments.length}</span>}
            </button>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-3 space-y-2 border-t border-border/20 pt-3">
                  {comments.map((c: Record<string, any>) => (
                    <div key={c.id} className="flex gap-2 text-xs">
                      <span className="font-semibold text-foreground">{(c.salespeople as Record<string, string> | null)?.name || '?'}:</span>
                      <span className="text-muted-foreground">{c.content}</span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment()}
                      placeholder="Comentar..."
                      className="flex-1 text-xs bg-background/50 rounded-lg px-3 py-1.5 border border-border/30 outline-none"
                    />
                    <Button size="icon" aria-label="Enviar" variant="ghost" className="h-7 w-7" onClick={handleComment}>
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
  );
});

VictoryFeedItem.displayName = 'VictoryFeedItem';
