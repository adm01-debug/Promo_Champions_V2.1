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

// AI Responses for the assistant
const AI_RESPONSES: Record<string, string[]> = {
  objection_price: [
    "Entendo sua preocupação com o preço. Vamos focar no retorno sobre o investimento:\n\n1. **Destaque o valor**, não o custo - Quanto o cliente perde sem a solução?\n2. **Fragmentize o preço** - Divida por dia/mês para parecer menor\n3. **Compare com alternativas** - O que custa NÃO resolver o problema?\n4. **Ofereça opções** - Diferentes pacotes para diferentes orçamentos\n\n💡 Frase-chave: \"Entendo que o investimento é importante. Vamos analisar juntos quanto você economizará/ganhará com essa solução?\"",
    "O preço é uma das objeções mais comuns! Aqui está como contornar:\n\n🎯 **Técnica do Sanduíche:**\n1. Reconheça a preocupação\n2. Apresente o valor e benefícios\n3. Reforce com cases de sucesso\n\n📊 **Argumente com números:**\n- ROI esperado\n- Economia de tempo/recursos\n- Custo de oportunidade\n\n💬 Exemplo: \"Muitos clientes tiveram a mesma preocupação inicial, mas após 3 meses reportaram economia de 40% em...\"",
  ],
  cold_calling: [
    "Cold calling ainda funciona quando feito corretamente! Aqui estão minhas dicas:\n\n📞 **Preparação (antes da ligação):**\n- Pesquise a empresa e o decisor\n- Tenha um objetivo claro para cada chamada\n- Prepare respostas para objeções comuns\n\n🗣️ **Durante a ligação:**\n1. Nos primeiros 10 segundos, capture atenção\n2. Fale menos, pergunte mais\n3. Use a técnica do espelhamento\n4. Termine com próximo passo claro\n\n⏰ **Melhores horários:**\n- Terça a quinta: 10-11h e 14-16h\n- Evite segunda de manhã e sexta à tarde",
    "Vamos turbinar suas cold calls! 🚀\n\n**Estrutura da ligação perfeita:**\n\n1. **Abertura** (10s): \"Olá [nome], não nos conhecemos, mas...\"\n\n2. **Hook** (20s): Apresente um insight ou dado relevante\n\n3. **Qualificação** (2min): Faça 2-3 perguntas estratégicas\n\n4. **Pitch** (1min): Conecte dor + solução\n\n5. **CTA** (30s): Próximo passo específico\n\n💡 **Dica de ouro:** Grave suas chamadas (com permissão) e analise mensalmente!",
  ],
  follow_up: [
    "Follow-up efetivo é arte e ciência! Aqui está meu framework:\n\n📅 **Cadência ideal:**\n- Dia 1: Email de agradecimento\n- Dia 3: Valor adicional (artigo/insight)\n- Dia 7: Check-in por telefone\n- Dia 14: Novo ângulo/abordagem\n- Dia 21: Último contato formal\n\n✨ **Boas práticas:**\n1. Sempre agregue valor, nunca só \"checando\"\n2. Varie os canais (email, ligação, LinkedIn)\n3. Personalize com contexto da última conversa\n4. Tenha um CTA claro em cada contato",
    "O segredo do follow-up está na consistência e valor!\n\n🎯 **Regra de ouro:** Cada contato deve trazer algo novo:\n- Insight do mercado\n- Case de sucesso relevante\n- Artigo interessante\n- Resposta a algo mencionado\n\n📧 **Template matador:**\n\"Oi [nome], lembrei de você quando vi [insight/notícia]. Como está a situação de [problema discutido]? Achei que [solução/recurso] poderia ajudar.\"\n\n⚡ **Automação:** Use CRM para lembretes, mas personalize cada mensagem!",
  ],
  closing: [
    "Fechamento é a coroação de todo o processo! 🏆\n\n**Técnicas comprovadas:**\n\n1. **Fechamento Assumido:** \"Quando podemos iniciar a implementação?\"\n\n2. **Alternativa:** \"Prefere o plano mensal ou anual?\"\n\n3. **Urgência Legítima:** \"A condição especial é válida até...\"\n\n4. **Resumo:** Recapitule benefícios antes de pedir decisão\n\n5. **Silêncio:** Faça a proposta e espere - não quebre o silêncio!\n\n💡 **Sinais de compra:**\n- Perguntas sobre implementação\n- Negociação de detalhes\n- Envolvimento de outros stakeholders",
    "Para fechar mais vendas, domine estas técnicas:\n\n🔑 **Perguntas de fechamento:**\n- \"O que impediria de seguirmos em frente hoje?\"\n- \"Em uma escala de 1-10, onde estamos?\"\n- \"Faz sentido para você?\"\n\n⚠️ **Erros comuns:**\n1. Ter medo de pedir a venda\n2. Falar demais após fazer a proposta\n3. Não identificar o decisor real\n4. Não criar senso de urgência\n\n✅ **Checklist pré-fechamento:**\n- [ ] Todas objeções tratadas?\n- [ ] Valor claramente demonstrado?\n- [ ] Próximos passos definidos?\n- [ ] Decisor envolvido?",
  ],
  motivation: [
    "Você é INCRÍVEL! 🔥\n\n💪 **Lembre-se:**\n- Cada \"não\" te aproxima do próximo \"sim\"\n- Os melhores vendedores também ouvem rejeições\n- Sua persistência é seu superpoder\n\n📈 **Dica energizante:**\nAntes de cada ligação, levante-se, respire fundo e sorria. Sua energia é contagiante!\n\n🌟 **Mantra do dia:**\n\"Eu crio oportunidades. Eu resolvo problemas. Eu faço a diferença.\"\n\nAGORA VAI LÁ E ARRASA! 🚀",
    "Hora de BRILHAR! ⭐\n\n🎯 **Foco no que você controla:**\n- Número de tentativas\n- Qualidade das conversas\n- Seu desenvolvimento contínuo\n\n💎 **Verdade inconveniente:**\nSuccesso em vendas = Habilidade + Esforço + Resiliência\n\n🏃 **Desafio:** Nas próximas 2 horas, faça 3 ligações que você estava adiando. O momentum vem da ação!\n\nVocê tem tudo que precisa. Agora é SÓ FAZER! 💪",
  ],
  general: [
    "Ótima pergunta! Estou aqui para ajudar com suas vendas.\n\nPosso te ajudar com:\n📞 Técnicas de prospecção\n🎯 Estratégias de fechamento\n🛡️ Como lidar com objeções\n📧 Templates de email\n💪 Motivação e mindset\n\nSobre o que você gostaria de aprofundar?",
    "Vamos juntos melhorar seus resultados! 🚀\n\nEstou aqui para ser seu coach de vendas. Me conta:\n- Qual seu maior desafio agora?\n- Que tipo de venda você faz?\n- Onde sente que pode melhorar?\n\nCom essas informações, posso dar dicas mais personalizadas!",
  ],
};

function getAIResponse(message: string, dealContext: DealContext | null): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for deal context questions
  if (dealContext) {
    if (lowerMessage.includes('analis') || lowerMessage.includes('avaliar')) {
      return `📊 **Análise do Deal: ${dealContext.clientName}**\n\n**Produto:** ${dealContext.productName}\n**Valor:** R$ ${dealContext.amount.toLocaleString('pt-BR')}\n**Status:** ${dealContext.status}\n\n**Pontos de atenção:**\n1. Verifique se o decisor está engajado\n2. Confirme o timing de compra\n3. Identifique possíveis objeções\n\n**Recomendação:** Com base no valor, sugiro uma abordagem consultiva focando em ROI e cases de sucesso similares.`;
    }
    if (lowerMessage.includes('fechar') || lowerMessage.includes('fechamento')) {
      return `🎯 **Estratégia de Fechamento para ${dealContext.clientName}**\n\n**Valor do deal:** R$ ${dealContext.amount.toLocaleString('pt-BR')}\n\n**Táticas recomendadas:**\n1. **Resumo de valor:** Recapitule os principais benefícios\n2. **Urgência legítima:** Crie um deadline natural\n3. **Fechamento alternativo:** "Preferem implementar em janeiro ou fevereiro?"\n\n**Próximo passo sugerido:** Agende uma call de decisão com todos os stakeholders.`;
    }
    if (lowerMessage.includes('risco')) {
      return `⚠️ **Análise de Riscos: ${dealContext.clientName}**\n\n**Deal:** ${dealContext.productName} - R$ ${dealContext.amount.toLocaleString('pt-BR')}\n\n**Riscos identificados:**\n1. 🔴 Ciclo de vendas prolongado\n2. 🟡 Múltiplos decisores\n3. 🟡 Concorrência ativa\n\n**Mitigações:**\n- Mantenha contato frequente (a cada 3-5 dias)\n- Mapeie todos os stakeholders\n- Destaque diferenciais competitivos`;
    }
    if (lowerMessage.includes('próximo') || lowerMessage.includes('passo') || lowerMessage.includes('ação')) {
      return `📋 **Plano de Ação: ${dealContext.clientName}**\n\n**Esta semana:**\n- [ ] Enviar material complementar\n- [ ] Agendar call de follow-up\n- [ ] Preparar proposta personalizada\n\n**Próxima semana:**\n- [ ] Apresentar proposta final\n- [ ] Negociar termos\n- [ ] Alinhar com decisores\n\n💡 **Dica:** Para deals acima de R$ 50k, inclua um executive sponsor no processo.`;
    }
    if (lowerMessage.includes('objeç') || lowerMessage.includes('objecao')) {
      return `🛡️ **Objeções Esperadas: ${dealContext.clientName}**\n\n**Para um deal de R$ ${dealContext.amount.toLocaleString('pt-BR')}:**\n\n1. **"O preço está alto"**\n   → Resposta: Destaque o ROI e custo de não resolver\n\n2. **"Preciso pensar"**\n   → Resposta: "O que especificamente gostaria de analisar melhor?"\n\n3. **"Vou consultar outros fornecedores"**\n   → Resposta: Reforce diferenciais e ofereça comparativo\n\n**Preparação:** Tenha cases de sucesso prontos para apresentar!`;
    }
  }
  
  // Check for keywords
  if (lowerMessage.includes('preço') || lowerMessage.includes('caro') || lowerMessage.includes('objeção') || lowerMessage.includes('objecao')) {
    return AI_RESPONSES.objection_price[Math.floor(Math.random() * AI_RESPONSES.objection_price.length)];
  }
  if (lowerMessage.includes('cold call') || lowerMessage.includes('ligação') || lowerMessage.includes('prospecção') || lowerMessage.includes('prospeccao')) {
    return AI_RESPONSES.cold_calling[Math.floor(Math.random() * AI_RESPONSES.cold_calling.length)];
  }
  if (lowerMessage.includes('follow') || lowerMessage.includes('acompanhar') || lowerMessage.includes('retorno')) {
    return AI_RESPONSES.follow_up[Math.floor(Math.random() * AI_RESPONSES.follow_up.length)];
  }
  if (lowerMessage.includes('fechar') || lowerMessage.includes('fechamento') || lowerMessage.includes('converter')) {
    return AI_RESPONSES.closing[Math.floor(Math.random() * AI_RESPONSES.closing.length)];
  }
  if (lowerMessage.includes('motiv') || lowerMessage.includes('energia') || lowerMessage.includes('ânimo') || lowerMessage.includes('animo')) {
    return AI_RESPONSES.motivation[Math.floor(Math.random() * AI_RESPONSES.motivation.length)];
  }
  
  return AI_RESPONSES.general[Math.floor(Math.random() * AI_RESPONSES.general.length)];
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
  
  const queryClient = useQueryClient();

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

  // Send message
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
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Generate AI response
    const aiResponse = getAIResponse(content, dealContext);
    
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Save assistant message
    if (convId) {
      await saveMessage(convId, 'assistant', aiResponse);
    }
    
    setIsLoading(false);
  }, [isLoading, currentConversationId, createConversation, saveMessage, dealContext]);

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
