import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Sparkles,
  User,
  MessageSquare,
  History,
  Plus,
  ChevronLeft,
  Search,
  X,
} from 'lucide-react';
import { useSalesAssistant, ChatMessage, ConversationWithMatches, DealContext } from '@/hooks/useSalesAssistant';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { VoiceControls } from './VoiceControls';
import { DealContextSelector } from './DealContextSelector';
import { DealPreviewCard } from './DealPreviewCard';
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

const DEAL_CONTEXT_PROMPTS = [
  { label: 'Analise este deal', icon: '🔍', prompt: 'Analise este deal em detalhes. Quais são os pontos fortes e fracos? O que posso melhorar?' },
  { label: 'Como fechar esta venda?', icon: '🎯', prompt: 'Como posso fechar esta venda? Me dê estratégias específicas considerando o valor e estágio atual.' },
  { label: 'Riscos deste deal', icon: '⚠️', prompt: 'Quais são os principais riscos deste deal? O que pode dar errado e como me preparar?' },
  { label: 'Próximos passos', icon: '📋', prompt: 'Quais devem ser os próximos passos para avançar este deal? Me dê um plano de ação concreto.' },
  { label: 'Objeções prováveis', icon: '🛡️', prompt: 'Quais objeções posso esperar deste cliente? Como devo responder a cada uma?' },
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
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    searchConversations,
    dealContext,
    setDealContext,
  } = useSalesAssistant(selectedSalesperson);

  const selectedPerson = salespeople?.find(s => s.id === selectedSalesperson);

  // ElevenLabs Voice Hook
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isLoadingTTS,
    startListening,
    stopListening,
    isListening,
    isProcessingSTT,
    transcript,
    voiceId,
    setVoiceId,
    isApiConfigured,
    useBrowserFallback,
    setUseBrowserFallback,
  } = useElevenLabsVoice({
    onSpeakStart: () => {},
    onSpeakEnd: () => {},
    onError: (error) => {
      toast({
        title: 'Erro de voz',
        description: error,
        variant: 'destructive',
      });
    },
  });

  // Auto-speak new assistant messages when TTS is enabled
  useEffect(() => {
    if (!isTTSEnabled || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === 'assistant' && 
      lastMessage.content && 
      lastMessage.id !== lastSpokenMessageRef.current &&
      !isLoading
    ) {
      lastSpokenMessageRef.current = lastMessage.id;
      speak(lastMessage.content);
    }
  }, [messages, isTTSEnabled, isLoading, speak]);

  // Update input when transcript changes from voice input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

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

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({
        title: 'Escutando...',
        description: 'Fale sua pergunta.',
      });
    }
  }, [isListening, startListening, stopListening, toast]);

  const handleToggleTTS = useCallback(() => {
    const newState = !isTTSEnabled;
    setIsTTSEnabled(newState);
    
    if (!newState) {
      stopSpeaking();
    } else {
      toast({
        title: 'Leitura ativada',
        description: isApiConfigured ? 'Usando voz ElevenLabs' : 'Usando voz do navegador',
      });
    }
  }, [isTTSEnabled, stopSpeaking, isApiConfigured, toast]);

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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          {conv.message_count !== undefined && conv.message_count > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                              {conv.message_count} msg
                            </Badge>
                          )}
                        </div>
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
      <CardHeader className="border-b border-border/50 pb-4 space-y-3">
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
        
        {/* Deal Context Selector */}
        {selectedSalesperson && (
          <div className="flex items-center gap-2">
            <DealContextSelector
              selectedDeal={dealContext ? {
                id: dealContext.dealId,
                client_name: dealContext.clientName,
                product_name: dealContext.productName,
                amount: dealContext.amount,
                status: dealContext.status,
                created_at: '',
              } : null}
              onSelectDeal={(deal) => {
                if (deal) {
                  setDealContext({
                    dealId: deal.id,
                    clientName: deal.client_name,
                    productName: deal.product_name,
                    amount: deal.amount,
                    status: deal.status,
                  });
                } else {
                  setDealContext(null);
                }
              }}
              salespersonId={selectedSalesperson}
            />
            {dealContext && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                🎯 Análise contextual ativada
              </Badge>
            )}
          </div>
        )}

        {/* Deal Context Quick Prompts */}
        {dealContext && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DEAL_CONTEXT_PROMPTS.map((prompt) => (
              <Badge
                key={prompt.label}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors py-1 px-2.5 text-xs"
                onClick={() => handleQuickPrompt(prompt.prompt)}
              >
                <span className="mr-1">{prompt.icon}</span>
                {prompt.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Deal Preview Card */}
        {dealContext && (
          <div className="px-4 pt-3">
            <DealPreviewCard
              dealId={dealContext.dealId}
              clientName={dealContext.clientName}
              productName={dealContext.productName}
              amount={dealContext.amount}
              status={dealContext.status}
            />
          </div>
        )}

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
              <div className="absolute right-2 bottom-2">
                <VoiceControls
                  isTTSEnabled={isTTSEnabled}
                  onToggleTTS={handleToggleTTS}
                  isSpeaking={isSpeaking}
                  isLoadingTTS={isLoadingTTS}
                  isListening={isListening}
                  onToggleListening={handleToggleListening}
                  isProcessingSTT={isProcessingSTT}
                  voiceId={voiceId}
                  onVoiceChange={setVoiceId}
                  isApiConfigured={isApiConfigured}
                  useBrowserFallback={useBrowserFallback}
                  onFallbackChange={setUseBrowserFallback}
                />
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
