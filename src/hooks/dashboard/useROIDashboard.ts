import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface SalespersonROI {
  id: string;
  name: string;
  role: string;
  commission_rate: number;
  // Revenue metrics
  totalRevenue: number;
  totalDeals: number;
  wonDeals: number;
  avgDealSize: number;
  // Cost metrics
  estimatedCost: number;
  commissionPaid: number;
  // ROI metrics
  roi: number;
  ltv: number;
  cac: number;
  paybackDays: number;
  revenuePerDay: number;
  // Activity efficiency
  activitiesCount: number;
  revenuePerActivity: number;
  conversionRate: number;
}

interface ROISummary {
  totalRevenue: number;
  totalCosts: number;
  overallROI: number;
  avgCAC: number;
  avgLTV: number;
  avgPayback: number;
  bestPerformer: SalespersonROI | null;
  worstPerformer: SalespersonROI | null;
}

export function useROIDashboard(periodMonths: number = 3) {
  const startDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - periodMonths);
    return d.toISOString();
  }, [periodMonths]);

  const { data: salespeople, isLoading: loadingSalespeople } = useQuery({
    queryKey: ['roi-salespeople'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('id, name, role, commission_rate, is_active, created_at')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sales, isLoading: loadingSales } = useQuery({
    queryKey: ['roi-sales', startDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, salesperson_id, amount, status, created_at')
        .gte('created_at', startDate);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['roi-activities', startDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('id, salesperson_id, activity_type, outcome')
        .gte('created_at', startDate);
      if (error) throw error;
      return data || [];
    },
  });

  const roiData = useMemo((): SalespersonROI[] => {
    if (!salespeople || !sales || !activities) return [];

    const BASE_SALARY_MONTHLY = 3500; // Estimated average base salary

    return salespeople.map((sp) => {
      const spSales = sales.filter((s) => s.salesperson_id === sp.id);
      const wonSales = spSales.filter((s) => s.status === 'won' || s.status === 'closed');
      const totalRevenue = wonSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const spActivities = activities.filter((a) => a.salesperson_id === sp.id);

      const commissionPaid = totalRevenue * (sp.commission_rate || 0.1);
      const estimatedCost = BASE_SALARY_MONTHLY * periodMonths + commissionPaid;

      const roi = estimatedCost > 0 ? ((totalRevenue - estimatedCost) / estimatedCost) * 100 : 0;

      // CAC: cost to acquire each client (approx by won deals)
      const cac = wonSales.length > 0 ? estimatedCost / wonSales.length : 0;

      // LTV: average deal value (simplified)
      const avgDealSize = wonSales.length > 0 ? totalRevenue / wonSales.length : 0;
      const ltv = avgDealSize * 2.5; // Estimated repeat factor

      // Payback: how many days to recover cost
      const daysInPeriod = periodMonths * 30;
      const revenuePerDay = daysInPeriod > 0 ? totalRevenue / daysInPeriod : 0;
      const paybackDays = revenuePerDay > 0 ? Math.round(estimatedCost / revenuePerDay) : 999;

      const conversionRate = spSales.length > 0 ? (wonSales.length / spSales.length) * 100 : 0;
      const revenuePerActivity = spActivities.length > 0 ? totalRevenue / spActivities.length : 0;

      return {
        id: sp.id,
        name: sp.name,
        role: sp.role || 'closer',
        commission_rate: sp.commission_rate || 0.1,
        totalRevenue,
        totalDeals: spSales.length,
        wonDeals: wonSales.length,
        avgDealSize,
        estimatedCost,
        commissionPaid,
        roi,
        ltv,
        cac,
        paybackDays,
        revenuePerDay,
        activitiesCount: spActivities.length,
        revenuePerActivity,
        conversionRate,
      };
    }).sort((a, b) => b.roi - a.roi);
  }, [salespeople, sales, activities, periodMonths]);

  const summary = useMemo((): ROISummary => {
    if (!roiData.length) {
      return { totalRevenue: 0, totalCosts: 0, overallROI: 0, avgCAC: 0, avgLTV: 0, avgPayback: 0, bestPerformer: null, worstPerformer: null };
    }

    const totalRevenue = roiData.reduce((s, r) => s + r.totalRevenue, 0);
    const totalCosts = roiData.reduce((s, r) => s + r.estimatedCost, 0);
    const overallROI = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;
    const avgCAC = roiData.reduce((s, r) => s + r.cac, 0) / roiData.length;
    const avgLTV = roiData.reduce((s, r) => s + r.ltv, 0) / roiData.length;
    const avgPayback = roiData.reduce((s, r) => s + r.paybackDays, 0) / roiData.length;

    return {
      totalRevenue,
      totalCosts,
      overallROI,
      avgCAC,
      avgLTV,
      avgPayback,
      bestPerformer: roiData[0] || null,
      worstPerformer: roiData[roiData.length - 1] || null,
    };
  }, [roiData]);

  return {
    roiData,
    summary,
    isLoading: loadingSalespeople || loadingSales || loadingActivities,
  };
}
