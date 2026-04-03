import { QuestionType } from '@/hooks/useDealChatHistory';

export const QUICK_PROMPTS = [
  { label: 'Como lidar com objeção de preço?', icon: '💰', type: 'objections' as QuestionType },
  { label: 'Dicas para cold calling', icon: '📞', type: 'strategy' as QuestionType },
  { label: 'Como fazer follow-up efetivo?', icon: '📧', type: 'strategy' as QuestionType },
  { label: 'Técnicas de fechamento', icon: '🎯', type: 'closing' as QuestionType },
  { label: 'Me motive!', icon: '🔥', type: 'general' as QuestionType },
];

export const DEAL_CONTEXT_PROMPTS = [
  { label: 'Analise este deal', icon: '🔍', prompt: 'Analise este deal em detalhes. Quais são os pontos fortes e fracos? O que posso melhorar?', type: 'analysis' as QuestionType },
  { label: 'Como fechar esta venda?', icon: '🎯', prompt: 'Como posso fechar esta venda? Me dê estratégias específicas considerando o valor e estágio atual.', type: 'closing' as QuestionType },
  { label: 'Riscos deste deal', icon: '⚠️', prompt: 'Quais são os principais riscos deste deal? O que pode dar errado e como me preparar?', type: 'analysis' as QuestionType },
  { label: 'Próximos passos', icon: '📋', prompt: 'Quais devem ser os próximos passos para avançar este deal? Me dê um plano de ação concreto.', type: 'strategy' as QuestionType },
  { label: 'Objeções prováveis', icon: '🛡️', prompt: 'Quais objeções posso esperar deste cliente? Como devo responder a cada uma?', type: 'objections' as QuestionType },
];

export type PeriodFilter = 'all' | 'week' | 'month' | '3months';

export function detectQuestionType(text: string): QuestionType {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('objeç') || lowerText.includes('objecao') || lowerText.includes('recusa') ||
      lowerText.includes('resistência') || lowerText.includes('resistencia') || lowerText.includes('não quer') ||
      lowerText.includes('caro') || lowerText.includes('preço alto')) {
    return 'objections';
  }

  if (lowerText.includes('fechar') || lowerText.includes('fechamento') || lowerText.includes('finalizar') ||
      lowerText.includes('concluir') || lowerText.includes('assinar') || lowerText.includes('contrato')) {
    return 'closing';
  }

  if (lowerText.includes('analis') || lowerText.includes('avaliar') || lowerText.includes('avaliação') ||
      lowerText.includes('risco') || lowerText.includes('pontos fortes') || lowerText.includes('pontos fracos') ||
      lowerText.includes('diagnóstico') || lowerText.includes('situação')) {
    return 'analysis';
  }

  if (lowerText.includes('estratégia') || lowerText.includes('estrategia') || lowerText.includes('plano') ||
      lowerText.includes('abordagem') || lowerText.includes('técnica') || lowerText.includes('como fazer') ||
      lowerText.includes('dicas') || lowerText.includes('próximos passos') || lowerText.includes('follow')) {
    return 'strategy';
  }

  return 'general';
}
