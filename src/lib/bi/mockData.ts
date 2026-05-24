export const MOCK_CLIENT_STATS = {
  ltv: 125000,
  avgTicket: 2450,
  recency: 12,
  orderCount: 48,
  lastOrders: [
    { id: '1', date: '2026-05-20', value: 3200, status: 'delivered' },
    { id: '2', date: '2026-05-15', value: 1500, status: 'delivered' },
    { id: '3', date: '2026-05-08', value: 4100, status: 'delivered' },
    { id: '4', date: '2026-04-28', value: 2800, status: 'delivered' },
    { id: '5', date: '2026-04-15', value: 3900, status: 'delivered' },
  ]
};

export const getMockIndustryTrends = () => [
  { name: 'MacBook Pro M3', growth: '+24%', sales: 1420 },
  { name: 'Dell XPS 15', growth: '+18%', sales: 980 },
  { name: 'Monitor LG 34" Curved', growth: '+32%', sales: 750 },
  { name: 'Cadeira Herman Miller', growth: '+12%', sales: 320 },
];

export const getMockSeasonality = (seedString: string = 'default') => {
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    quotes_count: Math.floor(10 + Math.sin(seed + i) * 8 + 10),
    total_revenue: Math.floor(30000 + Math.cos(seed + i) * 15000 + 20000),
    avg_ticket: 2000 + (seed % 1000)
  }));
};
