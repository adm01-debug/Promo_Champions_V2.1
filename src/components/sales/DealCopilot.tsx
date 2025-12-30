import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RefreshCw,
  Bot,
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface DealCopilotProps {
  dealId?: string;
  dealName?: string;
  onSuggestionApply?: (suggestion: string) => void;
  className?: string;
}

export const DealCopilot: FC<DealCopilotProps> = ({
  dealId,
  dealName,
  onSuggestionApply,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de vendas. Como posso ajudar com este negócio?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Baseado no histórico deste cliente, sugiro focar nos benefícios de custo-benefício e mencionar cases de empresas similares. Quer que eu elabore um pitch personalizado?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, feedback } : m
      )
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <Card className={cn('flex flex-col h-[500px]', className)}>
      <div className="p-4 border-b flex items-center gap-2">
        <Bot size={20} className="text-primary" />
        <div>
          <h3 className="font-semibold">Deal Copilot</h3>
          {dealName && (
            <p className="text-xs text-muted-foreground">{dealName}</p>
          )}
        </div>
        <Badge variant="outline" className="ml-auto gap-1">
          <Sparkles size={12} />
          IA
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {message.role === 'assistant' ? (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={16} />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                )}
              </Avatar>

              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'assistant'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                <p className="text-sm">{message.content}</p>
                
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6',
                        message.feedback === 'positive' && 'text-green-500'
                      )}
                      onClick={() => handleFeedback(message.id, 'positive')}
                    >
                      <ThumbsUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6',
                        message.feedback === 'negative' && 'text-red-500'
                      )}
                      onClick={() => handleFeedback(message.id, 'negative')}
                    >
                      <ThumbsDown size={12} />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot size={16} />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte sobre o negócio..."
            className="min-h-[60px] resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
