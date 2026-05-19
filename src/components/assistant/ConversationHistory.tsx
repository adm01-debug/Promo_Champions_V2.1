import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { ConversationWithMatches } from '@/hooks/sales/useSalesAssistant';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, subDays, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PeriodFilter } from './constants';

function HighlightedText({ text, searchTerm }: { text: string; searchTerm: string }) {
  if (!searchTerm.trim()) return <>{text}</>;
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface ConversationHistoryProps {
  selectedSalesperson: string | null;
  selectedPersonName?: string;
  conversations: ConversationWithMatches[] | undefined;
  loadingConversations: boolean;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
  searchConversations: (query: string) => Promise<ConversationWithMatches[]>;
}

export function ConversationHistory({
  selectedSalesperson,
  selectedPersonName,
  conversations,
  loadingConversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose,
  searchConversations,
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [searchResults, setSearchResults] = useState<ConversationWithMatches[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) { setSearchResults(null); setIsSearching(false); return; }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchConversations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchConversations]);

  const filterByPeriod = useCallback((convs: ConversationWithMatches[] | undefined) => {
    if (!convs || periodFilter === 'all') return convs;
    const now = new Date();
    let cutoffDate: Date;
    switch (periodFilter) {
      case 'week': cutoffDate = subDays(now, 7); break;
      case 'month': cutoffDate = subMonths(now, 1); break;
      case '3months': cutoffDate = subMonths(now, 3); break;
      default: return convs;
    }
    return convs.filter(conv => isAfter(new Date(conv.updated_at), cutoffDate));
  }, [periodFilter]);

  const displayedConversations = filterByPeriod(searchResults !== null ? searchResults : conversations);

  return (
    <Card className="flex flex-col h-[700px] border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4 space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-lg">Histórico de Conversas</CardTitle>
            <p className="text-xs text-muted-foreground">{selectedPersonName || 'Selecione um vendedor'}</p>
          </div>
        </div>
        {selectedSalesperson && conversations && conversations.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-9" />
            {searchQuery && (
              <Button variant="ghost" size="icon" aria-label="Limpar busca" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {selectedSalesperson && conversations && conversations.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {([
              { value: 'all' as PeriodFilter, label: 'Todas' },
              { value: 'week' as PeriodFilter, label: '7 dias' },
              { value: 'month' as PeriodFilter, label: '30 dias' },
              { value: '3months' as PeriodFilter, label: '3 meses' },
            ]).map((option) => (
              <Badge key={option.value} variant={periodFilter === option.value ? 'default' : 'outline'}
                className={cn('cursor-pointer text-xs', periodFilter === option.value ? '' : 'hover:bg-muted')}
                onClick={() => setPeriodFilter(option.value)}>
                {option.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {!selectedSalesperson ? (
            <div className="p-6 text-center text-muted-foreground">Selecione um vendedor para ver o histórico</div>
          ) : loadingConversations || isSearching ? (
            <div className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : displayedConversations?.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {searchQuery ? (<><Search className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>Nenhuma conversa encontrada para "{searchQuery}"</p></>) : 'Nenhuma conversa encontrada'}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {displayedConversations?.map((conv) => (
                <div key={conv.id} className={cn('p-4 cursor-pointer hover:bg-muted/50 transition-colors group', currentConversationId === conv.id && 'bg-muted/50')}
                  onClick={() => { onSelectConversation(conv.id); onClose(); }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        {conv.message_count !== undefined && conv.message_count > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">{conv.message_count} msg</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: ptBR })}</p>
                      {conv.matchedMessages && conv.matchedMessages.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {conv.matchedMessages.map((snippet, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 italic">
                              "<HighlightedText text={snippet} searchTerm={searchQuery} />"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Excluir"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}>
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
        <Button onClick={() => { onNewConversation(); onClose(); }} className="w-full">
          <Plus className="h-4 w-4 mr-2" />Nova Conversa
        </Button>
      </div>
    </Card>
  );
}
