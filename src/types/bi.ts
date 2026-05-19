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
