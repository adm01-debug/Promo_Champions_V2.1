import React, { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Smile, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useCompetitiveChat } from '@/hooks/useCompetitiveChat';
import { useSalespeople } from '@/hooks/useSalespeople';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompetitiveChatProps {
  salespersonId?: string;
}

const QUICK_REACTIONS = ['🔥', '💪', '😂', '👏', '⚡', '🏆'];
const TRASH_TALK = [
  '🔥 Prepara que eu tô chegando!',
  '💪 Hoje eu não paro!',
  '😎 Quem vai me parar?',
  '⚡ Máquina ligada!',
  '🎯 Meta? Já bati!',
  '👑 O trono é meu!',
];

const CompetitiveChatComponent: FC<CompetitiveChatProps> = ({ salespersonId }) => {
  const { data: salespeople } = useSalespeople();
  const me = salespeople?.find(s => s.id === salespersonId);
  const mySquadId = me?.squad_id;

  const [chatMode, setChatMode] = useState<'global' | 'squad'>('global');
  const { messages, isLoading, sendMessage, addReaction } = useCompetitiveChat(chatMode === 'squad' ? mySquadId : null);
  
  const [newMessage, setNewMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMode]);

  const handleSend = () => {
    if (!newMessage.trim() || !salespersonId) return;
    sendMessage.mutate({ salespersonId, message: newMessage.trim() });
    setNewMessage('');
  };

  const handleQuickMessage = (msg: string) => {
    if (!salespersonId) return;
    sendMessage.mutate({ salespersonId, message: msg, type: 'taunt' });
    setShowQuickMessages(false);
  };

  if (isLoading) {
    return <div className="h-96 rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <Card className="border-none shadow-lg overflow-hidden flex flex-col" style={{ height: '500px' }}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          Chat Competitivo
          <span className="text-xs text-muted-foreground font-normal ml-auto">
            {messages.length} mensagens
          </span>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-xs text-muted-foreground">Seja o primeiro a provocar! 🔥</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.salesperson_id === salespersonId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', isMe && 'flex-row-reverse')}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={msg.sender_avatar || undefined} />
                    <AvatarFallback className="text-[10px]">{msg.sender_name ?? 'Anônimo'[0]}</AvatarFallback>
                  </Avatar>
                  <div className={cn('max-w-[75%]', isMe && 'items-end')}>
                    <p className={cn('text-[10px] text-muted-foreground mb-0.5', isMe && 'text-right')}>
                      {msg.sender_name ?? 'Anônimo'}
                    </p>
                    <div className={cn(
                      'px-3 py-2 rounded-2xl text-sm',
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/60 text-foreground rounded-bl-md',
                      msg.message_type === 'taunt' && 'font-bold',
                    )}>
                      {msg.message}
                    </div>
                    {/* Reactions */}
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className={cn('flex gap-1 mt-1 flex-wrap', isMe && 'justify-end')}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => salespersonId && addReaction.mutate({ messageId: msg.id, salespersonId, emoji })}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full border transition-all',
                              (users as string[]).includes(salespersonId || '')
                                ? 'bg-primary/20 border-primary/30'
                                : 'bg-muted/30 border-border/20 hover:bg-muted/50'
                            )}
                          >
                            {emoji} {(users as string[]).length}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Quick react */}
                    {!isMe && salespersonId && (
                      <div className="flex gap-0.5 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                        {QUICK_REACTIONS.slice(0, 3).map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addReaction.mutate({ messageId: msg.id, salespersonId, emoji })}
                            className="text-xs hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={cn('text-[9px] text-muted-foreground mt-0.5', isMe && 'text-right')}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Quick Trash Talk */}
      <AnimatePresence>
        {showQuickMessages && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 py-2">
              {TRASH_TALK.map(msg => (
                <button
                  key={msg}
                  onClick={() => handleQuickMessage(msg)}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-foreground hover:bg-accent/20 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <CardContent className="p-3 border-t border-border/20 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon" aria-label="Reagir"
            className="h-8 w-8 shrink-0"
            onClick={() => setShowQuickMessages(!showQuickMessages)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Manda a provocação..."
            className="h-9 text-sm"
            disabled={!salespersonId}
          />
          <Button
            size="icon" aria-label="Enviar"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!newMessage.trim() || !salespersonId || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


export const CompetitiveChat = React.memo(CompetitiveChatComponent);
