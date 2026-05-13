import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateNextActions, analyzeSentiment, createEmailTemplate } from './useSalesAssistantHelpers';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  salesperson_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationWithMatches extends Conversation {
  matchedMessages?: string[];
}

export interface DealContext {
  dealId: string;
  clientName: string;
  productName: string;
  amount: number;
  status: string;
}

interface SalesInsight {
  type: 'action' | 'risk' | 'opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface AssistantResponse {
  insights: SalesInsight[];
  nextActions: string[];
  emailTemplate?: { subject: string; body: string; tone: 'formal' | 'casual' | 'urgent' };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export const useSalesAssistant = (
  salespersonId: string | null,
  aiName?: string,
  userName?: string
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [dealContext, setDealContext] = useState<DealContext | null>(null);

  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['chat-conversations', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data: convs, error } = await supabase
        .from('chat_conversations').select('*').eq('salesperson_id', salespersonId).order('updated_at', { ascending: false });
      if (error) throw error;
      const conversationsWithCounts = await Promise.all(
        (convs || []).map(async (conv) => {
          const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('conversation_id', conv.id);
          return { ...conv, message_count: count || 0 } as Conversation;
        })
      );
      return conversationsWithCounts;
    },
    enabled: !!salespersonId,
  });

  const loadConversation = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (error) { console.error('Error loading conversation:', error); return; }
    setMessages((data || []).map(msg => ({ id: msg.id, role: msg.role as 'user' | 'assistant', content: msg.content, timestamp: new Date(msg.created_at) })));
    setCurrentConversationId(conversationId);
  }, []);

  const createConversation = useCallback(async (firstMessage: string) => {
    if (!salespersonId) return null;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const { data, error } = await supabase.from('chat_conversations').insert({ salesperson_id: salespersonId, title }).select().single();
    if (error) { console.error('Error creating conversation:', error); return null; }
    setCurrentConversationId(data.id);
    refetchConversations();
    return data.id;
  }, [salespersonId, refetchConversations]);

  const saveMessage = useCallback(async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase.from('chat_messages').insert({ conversation_id: conversationId, role, content });
    if (error && import.meta.env.DEV) console.error('Error saving message:', error);
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    let convId = currentConversationId;
    if (!convId) { convId = await createConversation(content); }
    if (convId) { await saveMessage(convId, 'user', content); }

    const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-assistant-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message: content, salespersonId, conversationHistory,
            dealContext: dealContext ? { dealId: dealContext.dealId } : undefined,
            aiAssistantName: aiName, salespersonName: userName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsgId = `assistant-${Date.now()}`;

      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant' as const, content: '', timestamp: new Date() }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent } : m));
              }
            } catch { /* skip malformed SSE chunks */ }
          }
        }
      }

      if (convId && assistantContent) { await saveMessage(convId, 'assistant', assistantContent); }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: `❌ Desculpe, ocorreu um erro: ${errorMsg}. Tente novamente.`, timestamp: new Date() }]);
    }

    setIsLoading(false);
  }, [isLoading, currentConversationId, createConversation, saveMessage, dealContext, messages, salespersonId, aiName, userName]);

  const clearMessages = useCallback(() => { setMessages([]); setCurrentConversationId(null); setDealContext(null); }, []);
  const newConversation = useCallback(() => { clearMessages(); }, [clearMessages]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
    await supabase.from('chat_conversations').delete().eq('id', conversationId);
    if (conversationId === currentConversationId) { clearMessages(); }
    refetchConversations();
  }, [currentConversationId, clearMessages, refetchConversations]);

  const searchConversations = useCallback(async (query: string): Promise<ConversationWithMatches[]> => {
    if (!salespersonId || !query.trim()) return [];
    const { data: messageResults, error: msgError } = await supabase.from('chat_messages').select('conversation_id, content').ilike('content', `%${query}%`);
    if (msgError) { console.error('Error searching messages:', msgError); return []; }

    const conversationMatches: Record<string, string[]> = {};
    messageResults?.forEach(msg => {
      if (!conversationMatches[msg.conversation_id]) conversationMatches[msg.conversation_id] = [];
      const lowerContent = msg.content.toLowerCase();
      const idx = lowerContent.indexOf(query.toLowerCase());
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(msg.content.length, idx + query.length + 30);
        const snippet = (start > 0 ? '...' : '') + msg.content.slice(start, end) + (end < msg.content.length ? '...' : '');
        if (conversationMatches[msg.conversation_id].length < 2) conversationMatches[msg.conversation_id].push(snippet);
      }
    });

    const convIds = Object.keys(conversationMatches);
    if (convIds.length === 0) return [];
    const { data: convs, error: convError } = await supabase.from('chat_conversations').select('*').eq('salesperson_id', salespersonId).in('id', convIds).order('updated_at', { ascending: false });
    if (convError) { console.error('Error fetching conversations:', convError); return []; }

    return (convs || []).map(conv => ({ ...conv, matchedMessages: conversationMatches[conv.id] || [] }));
  }, [salespersonId]);

  return {
    messages, isLoading, sendMessage, clearMessages,
    conversations: conversations || [], loadingConversations,
    currentConversationId, loadConversation, newConversation,
    deleteConversation, searchConversations, dealContext, setDealContext,
  };
};

export const useDealAssistant = (dealId: string) => {
  const queryClient = useQueryClient();

  const getInsights = useQuery<AssistantResponse>({
    queryKey: ['sales-assistant', 'insights', dealId],
    queryFn: async (): Promise<AssistantResponse> => {
      const { data: deal, error } = await supabase.from('sales').select('*, activities(*)').eq('id', dealId).single();
      if (error) throw error;

      const insights: SalesInsight[] = [];
      const lastActivity = deal.activities?.[0];
      if (lastActivity) {
        const daysSinceActivity = (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceActivity > 7) {
          insights.push({ type: 'risk', title: 'No recent activity', description: `Deal has been inactive for ${Math.round(daysSinceActivity)} days. Consider reaching out.`, priority: 'high', actionable: true });
        }
      }
      if (deal.amount > 50000 && deal.status === 'Lead') {
        insights.push({ type: 'opportunity', title: 'High-value lead', description: 'This is a high-value opportunity. Prioritize qualification.', priority: 'high', actionable: true });
      }

      return { insights, nextActions: generateNextActions(deal, insights), sentiment: analyzeSentiment(deal.activities || []), confidence: 0.85 };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!dealId,
  });

  const generateEmail = useMutation({
    mutationFn: async (params: { purpose: 'follow-up' | 'proposal' | 'check-in' | 'closing'; context?: string }) => {
      const { data: deal } = await supabase.from('sales').select('*').eq('id', dealId).single();
      if (!deal) throw new Error('Deal not found');
      return createEmailTemplate(params.purpose, deal, params.context);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-assistant', 'insights', dealId] }); },
  });

  return { insights: getInsights.data, isLoading: getInsights.isLoading, isSuccess: getInsights.isSuccess, error: getInsights.error, data: getInsights.data, generateEmail };
};

export const useAISuggestions = (dealId: string) => {
  return useQuery({
    queryKey: ['ai-suggestions', dealId],
    queryFn: async () => ({
      talking_points: ['Emphasize ROI and time-to-value', 'Address potential objections proactively', 'Highlight competitive advantages'],
      questions_to_ask: ['What are your key success metrics?', 'Who else should be involved in the decision?', 'What is your timeline for implementation?'],
      objection_handling: {
        'Too expensive': 'Focus on total cost of ownership and ROI over time',
        'Not the right time': 'Highlight the cost of waiting and competitive risks',
        'Need more features': 'Explain our roadmap and customization options',
      },
    }),
    staleTime: 1000 * 60 * 30,
    enabled: !!dealId,
  });
};
