import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, MessageCircle, Send, ArrowRight } from 'lucide-react';
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
    <Card className="border-none shadow-lg overflow-hidden group/card transition-all duration-300 hover:shadow-xl">
      <div className={cn('bg-gradient-to-r', gradient)}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/10 transition-transform duration-500 group-hover/card:rotate-12">
              <Icon className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black italic text-foreground text-sm uppercase tracking-tighter">
                  {(item.salespeople as Record<string, string> | null)?.name || 'Vendedor'}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  • {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="font-display font-bold text-foreground text-lg leading-tight mt-1">{item.title}</p>
              {item.description && <p className="text-sm text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
              
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {item.value > 0 && (
                  <div className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-black text-primary italic">R$ {Number(item.value).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {(item.metadata as any)?.sale_id && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-6 p-0 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:no-underline flex items-center gap-1 group/btn" 
                    onClick={() => window.location.href = `/vendedor/${item.salesperson_id}`}
                  >
                    Ver Detalhes <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                )}
                {(item.metadata as any)?.battle_id && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-6 p-0 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:no-underline flex items-center gap-1 group/btn" 
                    onClick={() => window.location.href = `/arena`}
                  >
                    Ver Arena <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap">
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
                    'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all hover:scale-105 active:scale-95',
                    hasReacted ? 'bg-primary/20 border border-primary/30 text-primary shadow-sm' : 'bg-black/20 border border-white/5 hover:bg-black/40 text-muted-foreground'
                  )}
                >
                  <span className="text-sm">{emoji}</span>
                  {count > 0 && <span className="font-bold">{count}</span>}
                </button>
              );
            })}
            <button
              onClick={() => setShowComments(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs bg-black/20 border border-white/5 hover:bg-black/40 ml-auto transition-colors group/comment"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground group-hover/comment:text-primary transition-colors" />
              {comments.length > 0 && <span className="font-bold text-muted-foreground">{comments.length}</span>}
            </button>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                  {comments.map((c: Record<string, any>) => (
                    <div key={c.id} className="flex gap-3 text-xs bg-black/10 p-2.5 rounded-2xl border border-white/5">
                      <span className="font-black italic text-primary min-w-fit uppercase tracking-tighter">{(c.salespeople as Record<string, string> | null)?.name || '?'}:</span>
                      <span className="text-muted-foreground break-words">{c.content}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 items-center bg-black/20 p-1 rounded-2xl border border-white/5">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment()}
                      placeholder="Comentar..."
                      className="flex-1 text-xs bg-transparent rounded-lg px-4 py-2 border-none outline-none focus:ring-0"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-xl hover:bg-primary/20 hover:text-primary" 
                      onClick={handleComment}
                    >
                      <Send className="h-4 w-4" />
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
