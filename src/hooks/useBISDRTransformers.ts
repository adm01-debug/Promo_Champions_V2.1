import { differenceInDays, format, parseISO, differenceInBusinessDays, endOfMonth, startOfMonth } from "date-fns";
import type { BISDRData } from "./useBISDR";

interface SaleRecord {
  id: string;
  amount: number;
  status: string;
  source: string | null;
  client_name: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ActivityRecord {
  id: string;
  activity_type: string;
  outcome: string;
  contact_name: string | null;
  created_at: string;
}

interface ActivityGoals {
  calls_goal: number;
  emails_goal: number;
  meetings_goal: number;
  linkedin_goal: number;
  whatsapp_goal: number;
}

interface TransformParams {
  currentSales: SaleRecord[];
  previousSales: { id: string; status: string }[];
  lastYearSales: { id: string; status: string }[];
  activities: ActivityRecord[];
  previousActivities: { id: string }[];
  lastYearActivities: { id: string }[];
  activityGoals: ActivityGoals | null;
  allSDRs: { id: string; role: string }[];
  recentActivitiesData: { activity_type: string; contact_name: string | null; outcome: string; created_at: string }[];
  daysInPeriod: number;
  targetSalespersonId: string;
  sdrSalesCounts: Record<string, number>;
}

export function transformBISDRData(params: TransformParams): BISDRData {
  const {
    currentSales, previousSales, lastYearSales,
    activities, previousActivities, lastYearActivities,
    activityGoals, allSDRs, recentActivitiesData,
    daysInPeriod, targetSalespersonId, sdrSalesCounts
  } = params;

  const now = new Date();

  // Core metrics
  const totalLeadsGenerated = currentSales.length;
  const qualifiedLeads = currentSales.filter(s =>
    ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
  ).length;
  const qualificationRate = totalLeadsGenerated > 0 ? (qualifiedLeads / totalLeadsGenerated) * 100 : 0;

  const qualifiedSales = currentSales.filter(s => s.status !== "pending" && s.status !== "lost");
  const avgQualificationTime = qualifiedSales.length > 0
    ? qualifiedSales.reduce((sum, s) => sum + differenceInDays(parseISO(s.updated_at), parseISO(s.created_at)), 0) / qualifiedSales.length
    : 0;

  // Activities by type
  const activityTypeCounts: Record<string, { count: number; success: number }> = {};
  activities.forEach(a => {
    if (!activityTypeCounts[a.activity_type]) activityTypeCounts[a.activity_type] = { count: 0, success: 0 };
    activityTypeCounts[a.activity_type].count++;
    if (["qualified", "scheduled", "connected"].includes(a.outcome)) activityTypeCounts[a.activity_type].success++;
  });
  const activitiesByType = Object.entries(activityTypeCounts).map(([type, data]) => ({
    type, count: data.count, successRate: data.count > 0 ? (data.success / data.count) * 100 : 0
  }));

  const avgActivitiesPerDay = activities.length / daysInPeriod;
  const totalCalls = activities.filter(a => a.activity_type === "call").length;
  const totalEmails = activities.filter(a => a.activity_type === "email").length;
  const totalMeetings = activities.filter(a => a.activity_type === "meeting").length;
  const totalLinkedIn = activities.filter(a => a.activity_type === "linkedin").length;
  const totalWhatsApp = activities.filter(a => a.activity_type === "whatsapp").length;

  // Pipeline
  const pipelineDeals = currentSales.filter(s => ["pending", "qualified"].includes(s.status));
  const pipelineValue = pipelineDeals.reduce((sum, s) => sum + Number(s.amount), 0);
  const pipelineByStage = ["pending", "qualified"].map(stage => ({
    stage,
    count: pipelineDeals.filter(d => d.status === stage).length,
    value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0)
  }));

  // Comparisons
  const previousPeriod = {
    totalLeads: previousSales.length,
    qualifiedLeads: previousSales.filter(s => s.status !== "pending" && s.status !== "lost").length,
    totalActivities: previousActivities.length
  };
  const sameLastYear = {
    totalLeads: lastYearSales.length,
    qualifiedLeads: lastYearSales.filter(s => s.status !== "pending" && s.status !== "lost").length,
    totalActivities: lastYearActivities.length
  };

  // Goals & projections
  const totalActivityGoal = activityGoals
    ? activityGoals.calls_goal + activityGoals.emails_goal + activityGoals.meetings_goal + activityGoals.linkedin_goal + activityGoals.whatsapp_goal
    : 0;
  const monthEnd = endOfMonth(now);
  const monthStart = startOfMonth(now);
  const daysRemainingInMonth = differenceInBusinessDays(monthEnd, now);
  const daysElapsedInMonth = differenceInBusinessDays(now, monthStart);
  const leadGoal = totalActivityGoal * 0.15;
  const activityGoal = totalActivityGoal * daysInPeriod;
  const goalProgress = activityGoal > 0 ? (activities.length / activityGoal) * 100 : 0;
  const dailyLeadRate = daysElapsedInMonth > 0 ? totalLeadsGenerated / daysElapsedInMonth : 0;
  const projectedLeads = totalLeadsGenerated + (dailyLeadRate * daysRemainingInMonth);
  const dailyLeadsNeeded = daysRemainingInMonth > 0 ? Math.max(0, (leadGoal - totalLeadsGenerated) / daysRemainingInMonth) : 0;

  // Ranking
  const rankings = Object.entries(sdrSalesCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id], index) => ({ id, rank: index + 1 }));
  const currentRank = rankings.find(r => r.id === targetSalespersonId)?.rank || allSDRs.length;

  // Top prospects
  const topProspects = pipelineDeals
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map(s => ({ name: s.client_name, company: s.category, value: Number(s.amount), daysInPipeline: differenceInDays(now, parseISO(s.created_at)) }));

  // Recent activities
  const recentActivities = recentActivitiesData.map(a => ({
    type: a.activity_type, clientName: a.contact_name || "N/A", date: format(parseISO(a.created_at), "dd/MM HH:mm"), outcome: a.outcome
  }));

  // Charts
  const leadsByDayMap: Record<string, { generated: number; qualified: number }> = {};
  currentSales.forEach(sale => {
    const day = format(parseISO(sale.created_at), "dd/MM");
    if (!leadsByDayMap[day]) leadsByDayMap[day] = { generated: 0, qualified: 0 };
    leadsByDayMap[day].generated++;
    if (sale.status !== "pending" && sale.status !== "lost") leadsByDayMap[day].qualified++;
  });
  const leadsByDay = Object.entries(leadsByDayMap).map(([day, data]) => ({ day, ...data }));

  const activitiesByDayMap: Record<string, number> = {};
  activities.forEach(a => {
    const day = format(parseISO(a.created_at), "dd/MM");
    activitiesByDayMap[day] = (activitiesByDayMap[day] || 0) + 1;
  });
  const activitiesByDay = Object.entries(activitiesByDayMap).map(([day, count]) => ({ day, count }));

  // Conversion funnel
  const conversionFunnel = [
    { stage: "Leads Gerados", count: totalLeadsGenerated, percentage: 100 },
    { stage: "Qualificados", count: qualifiedLeads, percentage: qualificationRate },
    { stage: "Proposta", count: currentSales.filter(s => ["proposal", "negotiation", "completed"].includes(s.status)).length, percentage: 0 },
    { stage: "Fechados", count: currentSales.filter(s => s.status === "completed").length, percentage: 0 }
  ];
  conversionFunnel.forEach((stage, i) => {
    if (i > 0) stage.percentage = totalLeadsGenerated > 0 ? (stage.count / totalLeadsGenerated) * 100 : 0;
  });

  // Leads by source
  const leadsBySourceMap: Record<string, { count: number; qualified: number }> = {};
  currentSales.forEach(sale => {
    const source = sale.source || "other";
    if (!leadsBySourceMap[source]) leadsBySourceMap[source] = { count: 0, qualified: 0 };
    leadsBySourceMap[source].count++;
    if (sale.status !== "pending" && sale.status !== "lost") leadsBySourceMap[source].qualified++;
  });
  const leadsBySource = Object.entries(leadsBySourceMap).map(([source, data]) => ({
    source, count: data.count, qualificationRate: data.count > 0 ? (data.qualified / data.count) * 100 : 0
  }));

  return {
    totalLeadsGenerated, qualifiedLeads, qualificationRate, avgQualificationTime,
    totalActivities: activities.length, activitiesByType, avgActivitiesPerDay,
    totalCalls, totalEmails, totalMeetings, totalLinkedIn, totalWhatsApp,
    pipelineValue, pipelineCount: pipelineDeals.length, pipelineByStage,
    previousPeriod, sameLastYear,
    leadGoal, activityGoal, goalProgress, projectedLeads, dailyLeadsNeeded,
    currentRank, totalSDRs: allSDRs.length,
    topProspects, recentActivities, leadsByDay, activitiesByDay, conversionFunnel, leadsBySource
  };
}
