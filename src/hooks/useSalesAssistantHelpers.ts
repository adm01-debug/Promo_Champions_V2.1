/**
 * Helper functions for Sales Assistant
 * Extracted from useSalesAssistant.ts for modularity
 */

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

export function generateNextActions(deal: Record<string, unknown>, insights: SalesInsight[]): string[] {
  const actions: string[] = [];

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

  if (insights.some(i => i.type === 'risk')) {
    actions.unshift('Immediate follow-up required');
  }

  return actions.slice(0, 5);
}

export function analyzeSentiment(activities: Array<Record<string, unknown>>): 'positive' | 'neutral' | 'negative' {
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

export function createEmailTemplate(
  purpose: string,
  deal: Record<string, unknown>,
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
