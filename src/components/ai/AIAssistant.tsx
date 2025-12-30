import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context?: 'sales' | 'pipeline' | 'general';
  onSuggestionApply?: (suggestion: string) => void;
}

export const AIAssistant: FC<AIAssistantProps> = ({ context = 'general', onSuggestionApply }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de vendas. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { icon: TrendingUp, label: 'Analisar vendas', prompt: 'Analise minhas vendas do último mês' },
    { icon: Users, label: 'Sugerir abordagem', prompt: 'Sugira uma abordagem para um cliente hesitante' },
    { icon: Target, label: 'Priorizar leads', prompt: 'Quais leads devo priorizar hoje?' },
    { icon: Lightbulb, label: 'Dicas de fechamento', prompt: 'Me dê dicas para fechar uma venda' }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Esta é uma resposta simulada do assistente de IA. Em produção, seria integrado com um modelo de linguagem.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Assistente IA</h3>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
        <Sparkles className="h-4 w-4 text-primary ml-auto" />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="p-3 border-t">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => setInput(action.prompt)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

interface AISuggestionCardProps {
  title: string;
  description: string;
  confidence: number;
  onApply?: () => void;
  onDismiss?: () => void;
}

export const AISuggestionCard: FC<AISuggestionCardProps> = ({
  title,
  description,
  confidence,
  onApply,
  onDismiss
}) => {
  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground">
              {confidence}% confiança
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onApply}>
              Aplicar Sugestão
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Ignorar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface AIInsightProps {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  value: string;
  change?: number;
}

export const AIInsight: FC<AIInsightProps> = ({ type, title, value, change }) => {
  const icons = {
    opportunity: Sparkles,
    risk: Target,
    trend: TrendingUp
  };
  const colors = {
    opportunity: 'text-green-500 bg-green-500/10',
    risk: 'text-red-500 bg-red-500/10',
    trend: 'text-blue-500 bg-blue-500/10'
  };
  const Icon = icons[type];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`p-2 rounded-full ${colors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
      {change !== undefined && (
        <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
};
