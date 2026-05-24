export interface IndustryRecommendation {
  name: string;
  reason: string;
}

export const INDUSTRY_RECOMMENDATIONS: Record<string, IndustryRecommendation[]> = {
  'tecnologia': [
    { name: 'Infraestrutura Serverless', reason: 'Redução de 30% no custo operacional para empresas de tech.' },
    { name: 'Segurança Zero Trust', reason: 'Tendência crítica de conformidade para o próximo semestre.' }
  ],
  'industria': [
    { name: 'Automação Pneumática', reason: 'Ganho de escala em linhas de produção de alto volume.' },
    { name: 'Manutenção Preditiva IoT', reason: 'Redução de downtime em paradas não programadas.' }
  ],
  'varejo': [
    { name: 'Omnichannel Connect', reason: 'Integração de estoque físico e digital em tempo real.' },
    { name: 'CRM Predictor', reason: 'Aumento de 15% na recompra via segmentação comportamental.' }
  ],
  'servicos': [
    { name: 'Plataforma de CX IA', reason: 'Automação de 40% dos tickets de suporte nível 1.' },
    { name: 'BI Estratégico', reason: 'Visibilidade em tempo real de margens por projeto.' }
  ],
  'saude': [
    { name: 'Telemedicina Hub', reason: 'Expansão de atendimento geográfico sem custo fixo de clínica.' },
    { name: 'Gestão de Insumos Smart', reason: 'Redução de 12% em desperdícios de materiais cirúrgicos.' }
  ]
};

export const getExpertRecommendations = (ramo: string = ''): IndustryRecommendation[] => {
  const normalizedRamo = ramo.toLowerCase();
  for (const key in INDUSTRY_RECOMMENDATIONS) {
    if (normalizedRamo.includes(key)) return INDUSTRY_RECOMMENDATIONS[key];
  }
  return [
    { name: 'Consultoria de Eficiência', reason: 'Otimização de processos baseada nos benchmarks do setor.' },
    { name: 'Programa de Fidelidade IA', reason: 'Aumento do LTV através de ofertas personalizadas.' }
  ];
};
