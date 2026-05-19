import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, History, Plus, Loader2, MessageSquare } from 'lucide-react';
import { useSalesAssistant } from '@/hooks/useSalesAssistant';
import { useSalespeople } from '@/hooks/sales/useSalespeople';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { useDealChatHistory, QuestionType } from '@/hooks/useDealChatHistory';
import { useSalespersonPreferences } from '@/hooks/useSalespersonPreferences';
import { DealContextSelector } from './DealContextSelector';
import { DealPreviewCard } from './DealPreviewCard';
import { MessageBubble } from './MessageBubble';
import { ConversationHistory } from './ConversationHistory';
import { ChatInputArea } from './ChatInputArea';
import { QUICK_PROMPTS, DEAL_CONTEXT_PROMPTS, detectQuestionType } from './constants';
import { useToast } from '@/hooks/use-toast';

export function SalesAssistantChat() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | 'auto'>('auto');
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);
  const { toast } = useToast();

  const { data: salespeople } = useSalespeople();
  const { aiAssistantName, responseMode, voiceId: savedVoiceId } = useSalespersonPreferences();
  const isTTSEnabled = responseMode === 'audio' || responseMode === 'both';
  const selectedPerson = salespeople?.find(s => s.id === selectedSalesperson);

  const {
    messages, isLoading, sendMessage,
    conversations, loadingConversations, currentConversationId,
    loadConversation, newConversation, deleteConversation, searchConversations,
    dealContext, setDealContext,
  } = useSalesAssistant(selectedSalesperson, aiAssistantName, selectedPerson?.name);

  const { addEntry: addChatHistoryEntry } = useDealChatHistory(dealContext?.dealId || null);

  const {
    speak, stopSpeaking, isSpeaking, isLoadingTTS,
    startListening, stopListening, isListening, isProcessingSTT, transcript,
    isApiConfigured,
  } = useElevenLabsVoice({
    defaultVoiceId: savedVoiceId,
    onSpeakStart: () => {},
    onSpeakEnd: () => {},
    onError: (error) => toast({ title: 'Erro de voz', description: error, variant: 'destructive' }),
  });

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!isTTSEnabled || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.id !== lastSpokenMessageRef.current && !isLoading) {
      lastSpokenMessageRef.current = lastMessage.id;
      speak(lastMessage.content);
    }
  }, [messages, isTTSEnabled, isLoading, speak]);

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = (overrideType?: QuestionType) => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    const questionType = overrideType || (selectedQuestionType === 'auto' ? detectQuestionType(question) : selectedQuestionType);
    if (dealContext?.dealId && selectedSalesperson) {
      addChatHistoryEntry.mutate({ dealId: dealContext.dealId, salespersonId: selectedSalesperson, question, questionType });
    }
    sendMessage(question);
    setInput('');
  };

  const handleQuickPrompt = (prompt: string, type?: QuestionType) => {
    if (isLoading) return;
    const questionType = type || detectQuestionType(prompt);
    if (dealContext?.dealId && selectedSalesperson) {
      addChatHistoryEntry.mutate({ dealId: dealContext.dealId, salespersonId: selectedSalesperson, question: prompt, questionType });
    }
    sendMessage(prompt);
  };

  const handleToggleListening = useCallback(() => {
    if (isListening) { stopListening(); } else { startListening(); toast({ title: 'Escutando...', description: 'Fale sua pergunta.' }); }
  }, [isListening, startListening, stopListening, toast]);

  const handleManualSpeak = useCallback((text: string) => {
    if (isSpeaking) stopSpeaking(); else if (text) speak(text);
  }, [isSpeaking, stopSpeaking, speak]);

  if (showHistory) {
    return (
      <ConversationHistory
        selectedSalesperson={selectedSalesperson}
        selectedPersonName={selectedPerson?.name}
        conversations={conversations}
        loadingConversations={loadingConversations}
        currentConversationId={currentConversationId}
        onSelectConversation={loadConversation}
        onNewConversation={newConversation}
        onDeleteConversation={deleteConversation}
        onClose={() => setShowHistory(false)}
        searchConversations={searchConversations}
      />
    );
  }

  return (
    <Card className="flex flex-col h-[700px] border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{aiAssistantName}</CardTitle>
              <p className="text-xs text-muted-foreground">Seu coach de vendas pessoal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSalesperson || ''} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Selecionar vendedor" /></SelectTrigger>
              <SelectContent>
                {salespeople?.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={person.avatar_url || ''} />
                        <AvatarFallback className="text-[10px]">{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{person.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSalesperson && (
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="text-muted-foreground hover:text-foreground" title="Histórico de conversas" aria-label="Histórico de conversas">
                <History className="h-4 w-4" />
              </Button>
            )}
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={newConversation} className="text-muted-foreground hover:text-foreground" title="Nova conversa" aria-label="Nova conversa">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {selectedSalesperson && (
          <div className="flex items-center gap-2">
            <DealContextSelector
              selectedDeal={dealContext ? { id: dealContext.dealId, client_name: dealContext.clientName, product_name: dealContext.productName, amount: dealContext.amount, status: dealContext.status, created_at: '' } : null}
              onSelectDeal={(deal) => deal ? setDealContext({ dealId: deal.id, clientName: deal.client_name, productName: deal.product_name, amount: deal.amount, status: deal.status }) : setDealContext(null)}
              salespersonId={selectedSalesperson}
            />
            {dealContext && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">🎯 Análise contextual ativada</Badge>}
          </div>
        )}

        {dealContext && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DEAL_CONTEXT_PROMPTS.map((prompt) => (
              <Badge key={prompt.label} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors py-1 px-2.5 text-xs"
                onClick={() => handleQuickPrompt(prompt.prompt, prompt.type)}>
                <span className="mr-1">{prompt.icon}</span>{prompt.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {dealContext && (
          <div className="px-4 pt-3">
            <DealPreviewCard dealId={dealContext.dealId} clientName={dealContext.clientName} productName={dealContext.productName} amount={dealContext.amount} status={dealContext.status} onAskAssistant={handleQuickPrompt} />
          </div>
        )}

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4"><MessageSquare className="h-8 w-8 text-primary" /></div>
              <h3 className="font-semibold mb-2">Como posso ajudar?</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">Pergunte sobre técnicas de vendas, negociação, objeções ou peça motivação!</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {QUICK_PROMPTS.map((prompt) => (
                  <Badge key={prompt.label} variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors py-1.5 px-3"
                    onClick={() => handleQuickPrompt(prompt.label, prompt.type)}>
                    <span className="mr-1.5">{prompt.icon}</span>{prompt.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} salespersonAvatar={selectedPerson?.avatar_url || undefined}
                  showAudioButton={responseMode === 'audio' || responseMode === 'both'} onPlayAudio={handleManualSpeak} isSpeaking={isSpeaking} isLoadingTTS={isLoadingTTS} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" />Pensando...</div>
              )}
            </div>
          )}
        </ScrollArea>

        <ChatInputArea
          input={input} setInput={setInput} isLoading={isLoading} onSend={handleSend}
          selectedQuestionType={selectedQuestionType} setSelectedQuestionType={setSelectedQuestionType}
          hasDealContext={!!dealContext} selectedSalesperson={selectedSalesperson} selectedPersonName={selectedPerson?.name}
          isListening={isListening} onToggleListening={handleToggleListening} isProcessingSTT={isProcessingSTT}
          responseMode={responseMode} isApiConfigured={isApiConfigured}
        />
      </CardContent>
    </Card>
  );
}
