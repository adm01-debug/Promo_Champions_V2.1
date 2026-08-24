export interface SalespersonPerformanceData {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  revenue: number;
  deals: number;
  conversionRate: number;
  goalProgress: number;
  avgTicket: number;
  activities: number;
}

export interface BIGestorData {
  totalTeamRevenue: number;
  previousTeamRevenue: number;
  teamRevenueChange: number;
  totalTeamGoal: number;
  teamGoalProgress: number;
  activeSalespeople: number;
  avgPerformance: number;
  totalPipelineValue: number;
  totalPipelineDeals: number;
  atRiskDeals: number;
  avgDaysInPipeline: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  weightedForecast: number;
  projectedRevenue: number;
  confidenceLevel: number;
  salespeoplePerformance: SalespersonPerformanceData[];
  topPerformers: SalespersonPerformanceData[];
  underperformers: SalespersonPerformanceData[];
  revenueByMonth: { month: string; value: number }[];
  conversionByMonth: { month: string; rate: number }[];
  dealsBySource: { source: string; count: number; value: number }[];
  abcClients: { classification: string; count: number; revenue: number; percentage: number }[];
  stagnantDeals: number;
  missedGoals: number;
  lowActivitySalespeople: number;
}

export interface BIVendedorData {
  totalRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  totalDeals: number;
  completedDeals: number;
  conversionRate: number;
  avgTicket: number;
  currentGoal: number;
  goalProgress: number;
  daysRemaining: number;
  dailyRequired: number;
  commission: number;
  commissionRate: number;
  pipelineValue: number;
  pipelineDeals: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  avgDaysInPipeline: number;
  currentRank: number;
  totalSalespeople: number;
  totalActivities: number;
  activitiesByType: { type: string; count: number }[];
  activityGoalProgress: number;
  currentStreak: number;
  bestStreak: number;
  totalAchievements: number;
  recentAchievements: { type: string; date: string }[];
  salesByDay: { day: string; value: number }[];
  salesByCategory: { category: string; value: number }[];
  conversationInsights: {
    total: number;
    sentiment: { sentiment: string; label: string; value: number; color: string }[];
    topObjections: { label: string; count: number }[];
    buyingSignalsTotal: number;
    riskSignalsTotal: number;
  };
}

