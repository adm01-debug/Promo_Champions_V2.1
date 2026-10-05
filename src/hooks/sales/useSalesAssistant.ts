import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/integrations/supabase/env';

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

export const useSalesAssistant = (
  salespersonId: string | null,
  aiName?: string,
  userName?: string
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [dealContext, setDealContext] = useState<DealContext | null>(null);

  const {
    data: conversations,
    isLoading: loadingConversations,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['chat-conversations', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      // Batch-count messages for all conversations in one query instead of N separate requests
      const convIds = (convs || []).map(c => c.id);
      type CountRow = { conversation_id: string };
      const countRows: CountRow[] = convIds.length
        ? await chunkedIn<CountRow>(
            convIds,
            chunk =>
              supabase
                .from('chat_messages')
                .select('conversation_id')
                .in('conversation_id', chunk as string[]),
            { parallel: true, label: 'sales-assistant.msg-count' }
          )
        : [];
      const countMap: Record<string, number> = {};
      (countRows || []).forEach(r => {
        countMap[r.conversation_id] = (countMap[r.conversation_id] || 0) + 1;
      });
      return (convs || []).map(conv => ({
        ...conv,
        message_count: countMap[conv.id] || 0,
      })) as Conversation[];
    },
    enabled: !!salespersonId,
  });

  const loadConversation = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }
    setMessages(
      (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }))
    );
    setCurrentConversationId(conversationId);
  }, []);

  const createConversation = useCallback(
    async (firstMessage: string) => {
      if (!salespersonId) return null;
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      try {
        const { data, error } = await supabase
          .from('chat_conversations')
          .insert({ salesperson_id: salespersonId, title })
          .select()
          .single();
        if (error) throw error;
        setCurrentConversationId(data.id);
        refetchConversations();
        return data.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
      }
    },
    [salespersonId, refetchConversations]
  );

  const saveMessage = useCallback(
    async (conversationId: string, role: 'user' | 'assistant', content: string) => {
      try {
        const { error: msgError } = await supabase
          .from('chat_messages')
          .insert({ conversation_id: conversationId, role, content });

        if (msgError) throw msgError;

        const { error: convError } = await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (convError) throw convError;
      } catch (error) {
        console.error('Error saving message:', error);
        // Only re-throw if it's critical, or handle gracefully
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      setIsLoading(true);
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      let convId = currentConversationId;
      try {
        if (!convId) {
          convId = await createConversation(content);
        }
        if (convId) {
          await saveMessage(convId, 'user', content);
        } else {
          throw new Error('Não foi possível criar ou encontrar uma conversa.');
        }
      } catch (error) {
        console.error('Error in conversation/message setup:', error);
        setIsLoading(false);
        return;
      }

      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/sales-assistant-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
              apikey: SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              message: content,
              salespersonId,
              conversationHistory,
              dealContext: dealContext ? { dealId: dealContext.dealId } : undefined,
              aiAssistantName: aiName,
              salespersonName: userName,
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

        setMessages(prev => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant' as const,
            content: '',
            timestamp: new Date(),
          },
        ]);

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
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                    )
                  );
                }
              } catch {
                /* skip malformed SSE chunks */
              }
            }
          }
        }

        if (convId && assistantContent) {
          await saveMessage(convId, 'assistant', assistantContent);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `❌ Desculpe, ocorreu um erro: ${errorMsg}. Tente novamente.`,
            timestamp: new Date(),
          },
        ]);
      }

      setIsLoading(false);
    },
    [
      isLoading,
      currentConversationId,
      createConversation,
      saveMessage,
      dealContext,
      messages,
      salespersonId,
      aiName,
      userName,
    ]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setDealContext(null);
  }, []);
  const newConversation = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
      await supabase.from('chat_conversations').delete().eq('id', conversationId);
      if (conversationId === currentConversationId) {
        clearMessages();
      }
      refetchConversations();
    },
    [currentConversationId, clearMessages, refetchConversations]
  );

  const searchConversations = useCallback(
    async (query: string): Promise<ConversationWithMatches[]> => {
      if (!salespersonId || !query.trim()) return [];
      const { data: messageResults, error: msgError } = await supabase
        .from('chat_messages')
        .select('conversation_id, content')
        .ilike('content', `%${query}%`);
      if (msgError) {
        console.error('Error searching messages:', msgError);
        return [];
      }

      const conversationMatches: Record<string, string[]> = {};
      messageResults?.forEach(msg => {
        if (!conversationMatches[msg.conversation_id])
          conversationMatches[msg.conversation_id] = [];
        const lowerContent = msg.content.toLowerCase();
        const idx = lowerContent.indexOf(query.toLowerCase());
        if (idx !== -1) {
          const start = Math.max(0, idx - 30);
          const end = Math.min(msg.content.length, idx + query.length + 30);
          const snippet =
            (start > 0 ? '...' : '') +
            msg.content.slice(start, end) +
            (end < msg.content.length ? '...' : '');
          if (conversationMatches[msg.conversation_id].length < 2)
            conversationMatches[msg.conversation_id].push(snippet);
        }
      });

      const convIds = Object.keys(conversationMatches);
      if (convIds.length === 0) return [];
      const { data: convs, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('salesperson_id', salespersonId)
        // chunked-in-safe: convIds vem de list bounded por page size
        .in('id', convIds)
        .order('updated_at', { ascending: false });
      if (convError) {
        console.error('Error fetching conversations:', convError);
        return [];
      }

      return (convs || []).map(conv => ({
        ...conv,
        matchedMessages: conversationMatches[conv.id] || [],
      }));
    },
    [salespersonId]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversations: conversations || [],
    loadingConversations,
    currentConversationId,
    loadConversation,
    newConversation,
    deleteConversation,
    searchConversations,
    dealContext,
    setDealContext,
  };
};
