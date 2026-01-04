import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Hook for AI Sales Assistant
 * Provides AI-powered insights, suggestions, and email templates
 * Uses Claude API for intelligent assistance
 */
export const useSalesAssistant = (dealId: string) => {
  const queryClient = useQueryClient();

  // Get insights for a specific deal
  const getInsights = useQuery<AssistantResponse>({
    queryKey: ['sales-assistant', 'insights', dealId],
    queryFn: async (): Promise<AssistantResponse> => {
      // Fetch deal data
      const { data: deal, error } = await supabase
        .from('deals')
        .select(`
          *,
          client:clients(*),
          activities(*),
          notes(*)
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
            description: \`Deal has been inactive for \${Math.round(daysSinceActivity)} days. Consider reaching out.\`,
            priority: 'high',
            actionable: true,
          });
        }
      }

      // Check deal value vs stage
      if (deal.value > 50000 && deal.stage === 'Lead') {
        insights.push({
          type: 'opportunity',
          title: 'High-value lead',
          description: 'This is a high-value opportunity. Prioritize qualification.',
          priority: 'high',
          actionable: true,
        });
      }

      // Check for missing information
      if (!deal.client?.company) {
        insights.push({
          type: 'action',
          title: 'Missing company info',
          description: 'Client company information is missing. Update for better insights.',
          priority: 'medium',
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
        .from('deals')
        .select('*, client:clients(*)')
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
    error: getInsights.error,
    generateEmail,
  };
};

// Helper functions
function generateNextActions(deal: any, insights: SalesInsight[]): string[] {
  const actions: string[] = [];

  // Based on stage
  switch (deal.stage) {
    case 'Lead':
      actions.push('Schedule discovery call');
      actions.push('Send qualification questions');
      break;
    case 'Qualified':
      actions.push('Prepare custom proposal');
      actions.push('Schedule demo/presentation');
      break;
    case 'Proposal':
      actions.push('Follow up on proposal');
      actions.push('Address any concerns');
      break;
    case 'Negotiation':
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
    .filter(a => a.sentiment)
    .map(a => a.sentiment);

  if (sentiments.length === 0) return 'neutral';

  const positiveCount = sentiments.filter(s => s === 'positive').length;
  const negativeCount = sentiments.filter(s => s === 'negative').length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function createEmailTemplate(
  purpose: string,
  deal: any,
  context?: string
): EmailTemplate {
  const clientName = deal.client?.name || 'there';
  const companyName = deal.client?.company || 'your company';

  const templates: Record<string, EmailTemplate> = {
    'follow-up': {
      subject: \`Following up on our conversation - \${deal.title}\`,
      body: \`Hi \${clientName},

I wanted to follow up on our recent conversation about \${deal.title}.

\${context || 'I hope you've had a chance to review the information I shared.'}

Would you have time for a brief call this week to discuss next steps?

Best regards\`,
      tone: 'casual',
    },
    'proposal': {
      subject: \`Proposal for \${companyName} - \${deal.title}\`,
      body: \`Dear \${clientName},

Thank you for the opportunity to present our solution for \${deal.title}.

I've attached our detailed proposal which includes:
• Customized solution for your needs
• Pricing and timeline
• ROI projections
• Implementation plan

I'm confident this will help \${companyName} achieve \${context || 'your goals'}.

Would you like to schedule a call to discuss the proposal?

Best regards\`,
      tone: 'formal',
    },
    'check-in': {
      subject: \`Checking in - \${deal.title}\`,
      body: \`Hi \${clientName},

I hope this email finds you well!

I wanted to check in and see if you have any questions about \${deal.title}.

Is there anything I can help clarify or any additional information you need?

Looking forward to hearing from you.

Best regards\`,
      tone: 'casual',
    },
    'closing': {
      subject: \`Ready to move forward? - \${deal.title}\`,
      body: \`Dear \${clientName},

I hope you're as excited as we are about the potential partnership on \${deal.title}.

Based on our discussions, I believe we're aligned on:
• Solution scope and approach
• Timeline and deliverables
• Investment and value

I'd love to finalize the details and get started. Do you have time for a quick call this week?

Best regards\`,
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
      // This would integrate with Claude API or similar
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
