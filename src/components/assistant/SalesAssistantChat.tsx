import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  MessageSquare,
  History,
  Plus,
  ChevronLeft,
  Search,
  X,
  Calendar
} from 'lucide-react';
import { useSalesAssistant, ChatMessage, ConversationWithMatches } from '@/hooks/useSalesAssistant';
import { useSalespeople } from '@/hooks/useSalespeople';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, subDays, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PeriodFilter = 'all' | 'week' | 'month' | '3months';

const QUICK_PROMPTS = [
  { label: 'Como lidar com objeção de preço?', icon: '💰' },
  { label: 'Dicas para cold calling', icon: '📞' },
  { label: 'Como fazer follow-up efetivo?', icon: '📧' },
  { label: 'Técnicas de fechamento', icon: '🎯' },
  { label: 'Me motive!', icon: '🔥' },
];

// Check browser support for Speech Recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

// Highlight search term in text
function HighlightedText({ text, searchTerm }: { text: string; searchTerm: string }) {
  if (!searchTerm.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function SalesAssistantChat() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);
  const { toast } = useToast();

  const { data: salespeople } = useSalespeople();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    conversations,
    loadingConversations,
    currentConversationId,
    loadConversation,
    newConversation,
    deleteConversation,
    searchConversations
  } = useSalesAssistant(selectedSalesperson);

  const selectedPerson = salespeople?.find(s => s.id === selectedSalesperson);

  // Speech Synthesis function
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Navegador não suportado',
        description: 'Seu navegador não suporta síntese de voz.',
        variant: 'destructive',
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0];
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => setIsCurrentlySpeaking(true);
    utterance.onend = () => setIsCurrentlySpeaking(false);
    utterance.onerror = () => setIsCurrentlySpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [toast]);

  // Auto-speak new assistant messages when TTS is enabled
  useEffect(() => {
    if (!isSpeaking || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === 'assistant' && 
      lastMessage.content && 
      lastMessage.id !== lastSpokenMessageRef.current &&
      !isLoading
    ) {
      lastSpokenMessageRef.current = lastMessage.id;
      speakText(lastMessage.content);
    }
  }, [messages, isSpeaking, isLoading, speakText]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: 'Microfone bloqueado',
            description: 'Permita o acesso ao microfone nas configurações do navegador.',
            variant: 'destructive',
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Voices may load asynchronously
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const toggleVoice = useCallback(() => {
    if (!SpeechRecognition) {
      toast({
        title: 'Navegador não suportado',
        description: 'Use Chrome, Edge ou Safari para entrada de voz.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: 'Escutando...',
          description: 'Fale sua pergunta.',
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isListening, toast]);

  const toggleSpeaker = useCallback(() => {
    const newState = !isSpeaking;
    setIsSpeaking(newState);
    
    if (!newState) {
      // Stop any ongoing speech when disabled
      window.speechSynthesis.cancel();
      setIsCurrentlySpeaking(false);
    } else {
      toast({
        title: 'Leitura ativada',
        description: 'As respostas serão lidas em voz alta.',
      });
    }
  }, [isSpeaking, toast]);

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    newConversation();
    setShowHistory(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  // Search state for history
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [searchResults, setSearchResults] = useState<ConversationWithMatches[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced full-text search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchConversations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchConversations]);

  // Filter by period
  const filterByPeriod = useCallback((convs: typeof conversations) => {
    if (!convs || periodFilter === 'all') return convs;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (periodFilter) {
      case 'week':
        cutoffDate = subDays(now, 7);
        break;
      case 'month':
        cutoffDate = subMonths(now, 1);
        break;
      case '3months':
        cutoffDate = subMonths(now, 3);
        break;
      default:
        return convs;
    }
    
    return convs.filter(conv => isAfter(new Date(conv.updated_at), cutoffDate));
  }, [periodFilter]);

  // Use search results if available, otherwise use all conversations, then filter by period
  const displayedConversations = filterByPeriod(searchResults !== null ? searchResults : conversations);

  // History sidebar
  if (showHistory) {
    return (
      <Card className="flex flex-col h-[700px] border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4 space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-lg">Histórico de Conversas</CardTitle>
              <p className="text-xs text-muted-foreground">
                {selectedPerson?.name || 'Selecione um vendedor'}
              </p>
            </div>
          </div>
          {selectedSalesperson && conversations && conversations.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {selectedSalesperson && conversations && conversations.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {[
                { value: 'all' as PeriodFilter, label: 'Todas' },
                { value: 'week' as PeriodFilter, label: '7 dias' },
                { value: 'month' as PeriodFilter, label: '30 dias' },
                { value: '3months' as PeriodFilter, label: '3 meses' },
              ].map((option) => (
                <Badge
                  key={option.value}
                  variant={periodFilter === option.value ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-xs',
                    periodFilter === option.value ? '' : 'hover:bg-muted'
                  )}
                  onClick={() => setPeriodFilter(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {!selectedSalesperson ? (
              <div className="p-6 text-center text-muted-foreground">
                Selecione um vendedor para ver o histórico
              </div>
            ) : loadingConversations || isSearching ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayedConversations?.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {searchQuery ? (
                  <>
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa encontrada para "{searchQuery}"</p>
                  </>
                ) : (
                  'Nenhuma conversa encontrada'
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {displayedConversations?.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-muted/50 transition-colors group',
                      currentConversationId === conv.id && 'bg-muted/50'
                    )}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.updated_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                        {/* Show matched message snippets */}
                        {(conv as ConversationWithMatches).matchedMessages && (conv as ConversationWithMatches).matchedMessages!.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {(conv as ConversationWithMatches).matchedMessages!.map((snippet, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 italic">
                                "<HighlightedText text={snippet} searchTerm={searchQuery} />"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t border-border/50">
          <Button onClick={handleNewConversation} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </Card>
    );
  }

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
            {selectedSalesperson && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(true)}
                className="text-muted-foreground hover:text-foreground"
                title="Histórico de conversas"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
                className="text-muted-foreground hover:text-foreground"
                title="Nova conversa"
              >
                <Plus className="h-4 w-4" />
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
                    isSpeaking && 'text-primary bg-primary/10',
                    isCurrentlySpeaking && 'animate-pulse'
                  )}
                  onClick={toggleSpeaker}
                  title={isSpeaking ? 'Desativar leitura em voz alta' : 'Ativar leitura em voz alta'}
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
