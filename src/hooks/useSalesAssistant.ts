import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

interface EmailTemplate {
  subject: string;
  body: string;
  tone: 'formal' | 'casual' | 'urgent';
}

interface AssistantResponse {
  insights: SalesInsight[];
  nextActions: string[];
  emailTemplate?: EmailTemplate;
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
  
  const _queryClient = useQueryClient();

  // Fetch conversations for the salesperson
  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['chat-conversations', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;

      // Get message counts
      const conversationsWithCounts = await Promise.all(
        (convs || []).map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          
          return {
            ...conv,
            message_count: count || 0,
          } as Conversation;
        })
      );
      
      return conversationsWithCounts;
    },
    enabled: !!salespersonId,
  });

  // Load conversation messages
  const loadConversation = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading conversation:', error);
      }
      return;
    }
    
    const loadedMessages: ChatMessage[] = (data || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));
    
    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage: string) => {
    if (!salespersonId) return null;
    
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        salesperson_id: salespersonId,
        title,
      })
      .select()
      .single();
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating conversation:', error);
      }
      return null;
    }
    
    setCurrentConversationId(data.id);
    refetchConversations();
    return data.id;
  }, [salespersonId, refetchConversations]);

  // Save message to database
  const saveMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      });
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving message:', error);
      }
    }
    
    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }, []);

  // Send message using real AI edge function with streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get or create conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation(content);
    }
    
    // Save user message
    if (convId) {
      await saveMessage(convId, 'user', content);
    }

    // Build conversation history from current messages
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

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

      // Handle SSE streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsgId = `assistant-${Date.now()}`;

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
      }]);

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
                    m.id === assistantMsgId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      }

      // Save final assistant message
      if (convId && assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Desculpe, ocorreu um erro: ${errorMsg}. Tente novamente.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  }, [isLoading, currentConversationId, createConversation, saveMessage, dealContext, messages, salespersonId, aiName, userName]);

  // Clear messages and start new conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setDealContext(null);
  }, []);

  // New conversation
  const newConversation = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    // Delete messages first
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    // Delete conversation
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);
    
    // If it's the current conversation, clear it
    if (conversationId === currentConversationId) {
      clearMessages();
    }
    
    refetchConversations();
  }, [currentConversationId, clearMessages, refetchConversations]);

  // Search conversations
  const searchConversations = useCallback(async (query: string): Promise<ConversationWithMatches[]> => {
    if (!salespersonId || !query.trim()) return [];
    
    // Search in messages
    const { data: messageResults, error: msgError } = await supabase
      .from('chat_messages')
      .select('conversation_id, content')
      .ilike('content', `%${query}%`);
    
    if (msgError) {
      if (import.meta.env.DEV) {
        console.error('Error searching messages:', msgError);
      }
      return [];
    }
    
    // Get unique conversation IDs with matched snippets
    const conversationMatches: Record<string, string[]> = {};
    messageResults?.forEach(msg => {
      if (!conversationMatches[msg.conversation_id]) {
        conversationMatches[msg.conversation_id] = [];
      }
      // Get snippet around the match
      const lowerContent = msg.content.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const idx = lowerContent.indexOf(lowerQuery);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(msg.content.length, idx + query.length + 30);
        const snippet = (start > 0 ? '...' : '') + 
                       msg.content.slice(start, end) + 
                       (end < msg.content.length ? '...' : '');
        if (conversationMatches[msg.conversation_id].length < 2) {
          conversationMatches[msg.conversation_id].push(snippet);
        }
      }
    });
    
    const convIds = Object.keys(conversationMatches);
    if (convIds.length === 0) return [];
    
    // Fetch conversations
    const { data: convs, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('salesperson_id', salespersonId)
      .in('id', convIds)
      .order('updated_at', { ascending: false });
    
    if (convError) {
      if (import.meta.env.DEV) {
        console.error('Error fetching conversations:', convError);
      }
      return [];
    }
    
    return (convs || []).map(conv => ({
      ...conv,
      matchedMessages: conversationMatches[conv.id] || [],
    }));
  }, [salespersonId]);

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

/**
 * Hook for AI Sales Assistant for deal analysis
 * Provides AI-powered insights, suggestions, and email templates
 */
export const useDealAssistant = (dealId: string) => {
  const queryClient = useQueryClient();

  // Get insights for a specific deal
  const getInsights = useQuery<AssistantResponse>({
    queryKey: ['sales-assistant', 'insights', dealId],
    queryFn: async (): Promise<AssistantResponse> => {
      // Fetch deal data
      const { data: deal, error } = await supabase
        .from('sales')
        .select(`
          *,
          activities(*)
        `)
        .eq('id', dealId)
        .single();

      if (error) throw error;

      // Analyze deal context
      const insights: SalesInsight[] = [];

      // Check for stale deals
      const lastActivity = deal.activities?.[0];
      if (lastActivity) {
        const daysSinceActivity = (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceActivity > 7) {
          insights.push({
            type: 'risk',
            title: 'No recent activity',
            description: `Deal has been inactive for ${Math.round(daysSinceActivity)} days. Consider reaching out.`,
            priority: 'high',
            actionable: true,
          });
        }
      }

      // Check deal value vs stage
      if (deal.amount > 50000 && deal.status === 'Lead') {
        insights.push({
          type: 'opportunity',
          title: 'High-value lead',
          description: 'This is a high-value opportunity. Prioritize qualification.',
          priority: 'high',
          actionable: true,
        });
      }

      // Generate next actions
      const nextActions = generateNextActions(deal, insights);

      // Determine sentiment
      const sentiment = analyzeSentiment(deal.activities || []);

      return {
        insights,
        nextActions,
        sentiment,
        confidence: 0.85,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!dealId,
  });

  // Generate email template
  const generateEmail = useMutation({
    mutationFn: async (params: {
      purpose: 'follow-up' | 'proposal' | 'check-in' | 'closing';
      context?: string;
    }) => {
      const { data: deal } = await supabase
        .from('sales')
        .select('*')
        .eq('id', dealId)
        .single();

      if (!deal) throw new Error('Deal not found');

      // Generate email based on purpose
      const template = createEmailTemplate(
        params.purpose,
        deal,
        params.context
      );

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-assistant', 'insights', dealId] });
    },
  });

  return {
    insights: getInsights.data,
    isLoading: getInsights.isLoading,
    isSuccess: getInsights.isSuccess,
    error: getInsights.error,
    data: getInsights.data,
    generateEmail,
  };
};

// Helper functions
function generateNextActions(deal: any, insights: SalesInsight[]): string[] {
  const actions: string[] = [];

  // Based on stage
  switch (deal.status) {
    case 'Lead':
    case 'lead':
      actions.push('Schedule discovery call');
      actions.push('Send qualification questions');
      break;
    case 'Qualified':
    case 'qualified':
      actions.push('Prepare custom proposal');
      actions.push('Schedule demo/presentation');
      break;
    case 'Proposal':
    case 'proposal':
      actions.push('Follow up on proposal');
      actions.push('Address any concerns');
      break;
    case 'Negotiation':
    case 'negotiation':
      actions.push('Prepare final offer');
      actions.push('Schedule decision call');
      break;
  }

  // Based on insights
  if (insights.some(i => i.type === 'risk')) {
    actions.unshift('Immediate follow-up required');
  }

  return actions.slice(0, 5);
}

function analyzeSentiment(activities: any[]): 'positive' | 'neutral' | 'negative' {
  const recentActivities = activities.slice(0, 5);
  
  const sentiments = recentActivities
    .filter(a => a.outcome)
    .map(a => a.outcome);

  if (sentiments.length === 0) return 'neutral';

  const positiveCount = sentiments.filter(s => s === 'positive' || s === 'success').length;
  const negativeCount = sentiments.filter(s => s === 'negative' || s === 'failed').length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function createEmailTemplate(
  purpose: string,
  deal: any,
  context?: string
): EmailTemplate {
  const clientName = deal.client_name || 'there';

  const templates: Record<string, EmailTemplate> = {
    'follow-up': {
      subject: `Following up on our conversation - ${deal.product_name}`,
      body: `Hi ${clientName},

I wanted to follow up on our recent conversation about ${deal.product_name}.

${context || 'I hope you\'ve had a chance to review the information I shared.'}

Would you have time for a brief call this week to discuss next steps?

Best regards`,
      tone: 'casual',
    },
    'proposal': {
      subject: `Proposal for ${deal.product_name}`,
      body: `Dear ${clientName},

Thank you for the opportunity to present our solution for ${deal.product_name}.

I've attached our detailed proposal which includes:
• Customized solution for your needs
• Pricing and timeline
• ROI projections
• Implementation plan

I'm confident this will help you achieve ${context || 'your goals'}.

Would you like to schedule a call to discuss the proposal?

Best regards`,
      tone: 'formal',
    },
    'check-in': {
      subject: `Checking in - ${deal.product_name}`,
      body: `Hi ${clientName},

I hope this email finds you well!

I wanted to check in and see if you have any questions about ${deal.product_name}.

Is there anything I can help clarify or any additional information you need?

Looking forward to hearing from you.

Best regards`,
      tone: 'casual',
    },
    'closing': {
      subject: `Ready to move forward? - ${deal.product_name}`,
      body: `Dear ${clientName},

I hope you're as excited as we are about the potential partnership on ${deal.product_name}.

Based on our discussions, I believe we're aligned on:
• Solution scope and approach
• Timeline and deliverables
• Investment and value

I'd love to finalize the details and get started. Do you have time for a quick call this week?

Best regards`,
      tone: 'formal',
    },
  };

  return templates[purpose] || templates['follow-up'];
}

// Hook for generating AI-powered suggestions (advanced)
export const useAISuggestions = (dealId: string) => {
  return useQuery({
    queryKey: ['ai-suggestions', dealId],
    queryFn: async () => {
      // This would integrate with AI API
      // For now, return structured suggestions
      
      const suggestions = {
        talking_points: [
          'Emphasize ROI and time-to-value',
          'Address potential objections proactively',
          'Highlight competitive advantages',
        ],
        questions_to_ask: [
          'What are your key success metrics?',
          'Who else should be involved in the decision?',
          'What is your timeline for implementation?',
        ],
        objection_handling: {
          'Too expensive': 'Focus on total cost of ownership and ROI over time',
          'Not the right time': 'Highlight the cost of waiting and competitive risks',
          'Need more features': 'Explain our roadmap and customization options',
        },
      };

      return suggestions;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!dealId,
  });
};
