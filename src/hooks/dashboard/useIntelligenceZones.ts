import { useQuery } from "@tanstack/react-query";

// Mock data generator for Intelligence Zones
const getMockZonesData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    customer360: {
      ltv: 125000,
      avgTicket: 2450,
      recency: 12, // days
      orderCount: 48,
      lastOrders: [
        { id: 1, date: '2026-05-20', value: 3200, status: 'delivered' },
        { id: 2, date: '2026-05-15', value: 1500, status: 'delivered' },
        { id: 3, date: '2026-05-08', value: 4100, status: 'delivered' },
        { id: 4, date: '2026-04-28', value: 2200, status: 'delivered' },
        { id: 5, date: '2026-04-15', value: 1800, status: 'delivered' },
      ]
    },
    benchmarks: [
      { metric: 'Volume', client: 85, sector: 72, unit: 'un' },
      { metric: 'Conversão', client: 12.4, sector: 10.8, unit: '%' },
      { metric: 'Frequência', client: 4.2, sector: 3.5, unit: 'ped/mês' },
      { metric: 'Satisfação', client: 92, sector: 88, unit: 'pts' },
    ],
    affinity: {
      topCategories: ['Eletrônicos', 'Periféricos', 'Office'],
      suggestedProducts: [
        { name: 'Monitor 4K UltraWide', confidence: 94 },
        { name: 'Teclado Mecânico RGB', confidence: 88 },
        { name: 'Cadeira Ergonômica Pro', confidence: 82 },
      ]
    },
    sectorTrends: [
      { name: 'MacBook Pro M3', growth: '+24%', sales: 1420 },
      { name: 'Dell XPS 15', growth: '+18%', sales: 980 },
      { name: 'Logitech MX Master 3S', growth: '+32%', sales: 2100 },
      { name: 'Webcam 4K Streamer', growth: '+15%', sales: 540 },
    ],
    seasonality: {
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      clientData: [45, 52, 38, 65, 88, 72, 45, 55, 62, 78, 95, 110],
      sectorData: [40, 45, 42, 58, 75, 80, 50, 60, 65, 70, 85, 120],
      nextPeak: { month: 'Novembro', insight: 'Aumento histórico de 22% no setor de Eletrônicos durante a Black Friday.' }
    },
    expertCurated: [
      { name: 'Kit Home Office Premium', reason: 'Essencial para o crescimento projetado do setor este trimestre.' },
      { name: 'Segurança Cloud Pro', reason: 'Tendência crítica de conformidade para empresas do seu porte.' },
      { name: 'Consultoria de Workflow AI', reason: 'Otimização de processos identificada como principal dor no setor.' }
    ]
  };
};

export const useIntelligenceZones = (clientId?: string) => {
  return useQuery({
    queryKey: ['intelligence-zones', clientId],
    queryFn: () => getMockZonesData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
