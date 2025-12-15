import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Loader2, 
  Trash2, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  MessageSquare
} from 'lucide-react';
import { useSalesAssistant, ChatMessage } from '@/hooks/useSalesAssistant';
import { useSalespeople } from '@/hooks/useSalespeople';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  { label: 'Como lidar com objeção de preço?', icon: '💰' },
  { label: 'Dicas para cold calling', icon: '📞' },
  { label: 'Como fazer follow-up efetivo?', icon: '📧' },
  { label: 'Técnicas de fechamento', icon: '🎯' },
  { label: 'Me motive!', icon: '🔥' },
];

interface MessageBubbleProps {
  message: ChatMessage;
  salespersonAvatar?: string;
}

function MessageBubble({ message, salespersonAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : '')}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={salespersonAvatar || ''} />
            <AvatarFallback className="bg-primary/20">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted/50 border border-border/50 rounded-bl-md'
        )}
      >
        <div className="whitespace-pre-wrap">{message.content || '...'}</div>
        <div className={cn('text-[10px] mt-1 opacity-60', isUser ? 'text-right' : '')}>
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function SalesAssistantChat() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: salespeople } = useSalespeople();
  const { messages, isLoading, sendMessage, clearMessages } = useSalesAssistant(selectedSalesperson);

  const selectedPerson = salespeople?.find(s => s.id === selectedSalesperson);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice functionality would be implemented here with ElevenLabs
  };

  const toggleSpeaker = () => {
    setIsSpeaking(!isSpeaking);
    // Text-to-speech would be implemented here
  };

  return (
    <Card className="flex flex-col h-[700px] border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Coach de Vendas IA</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tire dúvidas, receba dicas e motivação
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSalesperson || ''} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salespeople?.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={person.avatar_url || ''} />
                        <AvatarFallback className="text-[10px]">
                          {person.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{person.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Como posso ajudar?</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Pergunte sobre técnicas de vendas, negociação, objeções ou peça motivação!
              </p>
              
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {QUICK_PROMPTS.map((prompt) => (
                  <Badge
                    key={prompt.label}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors py-1.5 px-3"
                    onClick={() => handleQuickPrompt(prompt.label)}
                  >
                    <span className="mr-1.5">{prompt.icon}</span>
                    {prompt.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  salespersonAvatar={selectedPerson?.avatar_url || undefined}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pensando...
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="min-h-[44px] max-h-[120px] resize-none pr-20"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7',
                    isListening && 'text-destructive bg-destructive/10'
                  )}
                  onClick={toggleVoice}
                  title="Entrada por voz"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7',
                    isSpeaking && 'text-primary bg-primary/10'
                  )}
                  onClick={toggleSpeaker}
                  title="Ler respostas em voz alta"
                >
                  {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {selectedSalesperson
              ? `Respostas personalizadas para ${selectedPerson?.name}`
              : 'Selecione um vendedor para respostas personalizadas'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
