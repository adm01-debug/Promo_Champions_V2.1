import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
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

export function useSalesAssistant(salespersonId: string | null, aiAssistantName?: string, salespersonName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [dealContext, setDealContext] = useState<DealContext | null>(null);
  const queryClient = useQueryClient();

  // Fetch conversations for the salesperson with message counts
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['chat-conversations', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      
      // Get conversations
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      
      // Get message counts for each conversation
      const conversationIds = convs.map(c => c.id);
      const { data: messageCounts, error: countError } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds);
      
      if (countError) throw countError;
      
      // Count messages per conversation
      const countMap = new Map<string, number>();
      messageCounts?.forEach(m => {
        countMap.set(m.conversation_id, (countMap.get(m.conversation_id) || 0) + 1);
      });
      
      return convs.map(conv => ({
        ...conv,
        message_count: countMap.get(conv.id) || 0,
      })) as Conversation[];
    },
    enabled: !!salespersonId,
  });

  // Search conversations by message content
  const searchConversations = useCallback(async (query: string): Promise<ConversationWithMatches[]> => {
    if (!salespersonId || !query.trim()) return conversations || [];
    
    const searchTerm = query.toLowerCase().trim();
    
    // First get all conversation IDs for this salesperson
    const { data: convs, error: convsError } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('salesperson_id', salespersonId)
      .order('updated_at', { ascending: false });
    
    if (convsError || !convs) return [];
    
    // Get all messages for these conversations
    const conversationIds = convs.map(c => c.id);
    const { data: allMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('conversation_id, content')
      .in('conversation_id', conversationIds);
    
    if (messagesError) return [];
    
    // Filter conversations that have matching messages or titles
    const results: ConversationWithMatches[] = [];
    
    for (const conv of convs) {
      const titleMatch = conv.title.toLowerCase().includes(searchTerm);
      const convMessages = allMessages?.filter(m => m.conversation_id === conv.id) || [];
      const matchingMessages = convMessages
        .filter(m => m.content.toLowerCase().includes(searchTerm))
        .map(m => {
          // Extract a snippet around the match
          const content = m.content;
          const matchIndex = content.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(content.length, matchIndex + searchTerm.length + 30);
          let snippet = content.slice(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < content.length) snippet = snippet + '...';
          return snippet;
        });
      
      if (titleMatch || matchingMessages.length > 0) {
        results.push({
          ...conv,
          matchedMessages: matchingMessages.slice(0, 2), // Limit to 2 snippets
        });
      }
    }
    
    return results;
  }, [salespersonId, conversations]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }))
    );
    setCurrentConversationId(conversationId);
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage: string) => {
    if (!salespersonId) return null;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ salesperson_id: salespersonId, title })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    queryClient.invalidateQueries({ queryKey: ['chat-conversations', salespersonId] });
    return data.id;
  }, [salespersonId, queryClient]);

  // Save message to database
  const saveMessage = useCallback(async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, role, content });

    if (error) {
      console.error('Error saving message:', error);
    }

    // Update conversation updated_at
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }, []);

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations', salespersonId] });
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create or use existing conversation
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createConversation(content);
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    }

    // Save user message
    if (conversationId) {
      await saveMessage(conversationId, 'user', content);
    }

    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    // Create initial assistant message
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-assistant-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: content,
            salespersonId,
            conversationHistory,
            aiAssistantName,
            salespersonName,
            dealContext: dealContext ? {
              dealId: dealContext.dealId,
              clientName: dealContext.clientName,
              productName: dealContext.productName,
              amount: dealContext.amount,
              status: dealContext.status,
            } : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant response
      if (conversationId && assistantContent) {
        await saveMessage(conversationId, 'assistant', assistantContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: errorMessage }
            : m
        )
      );
      // Save error message too
      if (conversationId) {
        await saveMessage(conversationId, 'assistant', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, salespersonId, currentConversationId, createConversation, saveMessage, dealContext, aiAssistantName, salespersonName]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [deleteConversationMutation, currentConversationId]);

  // Reset when salesperson changes
  useEffect(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, [salespersonId]);

  return {
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
  };
}
