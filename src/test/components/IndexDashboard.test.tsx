/**
 * Index Dashboard Page Tests
 * Verifies: role-aware sections, component composition, data-tour markers
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../../pages/Index.tsx'),
  'utf-8'
);

describe('Index Dashboard Composition', () => {
  // === Role-aware sections ===
  it('uses useDashboardPriorities hook', () => {
    expect(source).toContain('useDashboardPriorities');
  });

  it('passes priorities to Analytics section', () => {
    expect(source).toContain('priorities.showAnalyticsOpen');
  });

  it('passes priorities to Gamification section', () => {
    expect(source).toContain('priorities.showGamificationOpen');
  });

  it('passes priorities to Performance section', () => {
    expect(source).toContain('priorities.showPerformanceOpen');
  });

  it('passes priorities to Engagement section', () => {
    expect(source).toContain('priorities.showEngagementOpen');
  });

  // === Section structure ===
  it('has 4 DashboardSections', () => {
    const count = (source.match(/DashboardSection/g) || []).length;
    // Each section uses DashboardSection opening + closing = x2 per section, plus import
    expect(count).toBeGreaterThanOrEqual(9); // 4 sections * 2 + import
  });

  it('Analytics section has BarChart3 icon', () => {
    expect(source).toContain('BarChart3');
  });

  it('Gamification section has Trophy icon', () => {
    expect(source).toContain('Trophy');
  });

  it('Performance section has Zap icon', () => {
    expect(source).toContain('Zap');
  });

  it('Engagement section has Heart icon', () => {
    expect(source).toContain('Heart');
  });

  // === Data tour attributes ===
  it('has data-tour="stats" on KPI grid', () => {
    expect(source).toContain('data-tour="stats"');
  });

  it('has data-tour="goals" on goals section', () => {
    expect(source).toContain('data-tour="goals"');
  });

  it('has data-tour="gamification" on gamification grid', () => {
    expect(source).toContain('data-tour="gamification"');
  });

  // === Key components ===
  it('includes DashboardHeader', () => {
    expect(source).toContain('DashboardHeader');
  });

  it('includes OnboardingChecklist', () => {
    expect(source).toContain('OnboardingChecklist');
  });

  it('includes SeasonalEventBanner', () => {
    expect(source).toContain('SeasonalEventBanner');
  });

  it('includes FlashSalesBanner', () => {
    expect(source).toContain('FlashSalesBanner');
  });

  it('includes CompetitiveStatusBar', () => {
    expect(source).toContain('CompetitiveStatusBar');
  });

  it('includes SalesChart', () => {
    expect(source).toContain('SalesChart');
  });

  it('includes GoalProgress', () => {
    expect(source).toContain('GoalProgress');
  });

  it('includes FunnelChart', () => {
    expect(source).toContain('FunnelChart');
  });

  it('includes SalesForecast', () => {
    expect(source).toContain('SalesForecast');
  });

  // === Empty state handling ===
  it('conditionally renders DashboardEmptyState for revenue', () => {
    expect(source).toContain('DashboardEmptyState type="revenue"');
  });

  it('conditionally renders DashboardEmptyState for sales', () => {
    expect(source).toContain('DashboardEmptyState type="sales"');
  });

  it('conditionally renders DashboardEmptyState for clients', () => {
    expect(source).toContain('DashboardEmptyState type="clients"');
  });

  it('conditionally renders DashboardEmptyState for conversion', () => {
    expect(source).toContain('DashboardEmptyState type="conversion"');
  });

  // === Performance widgets ===
  it('includes MicroGoalsWidget', () => {
    expect(source).toContain('MicroGoalsWidget');
  });

  it('includes VelocityScoreWidget', () => {
    expect(source).toContain('VelocityScoreWidget');
  });

  it('includes ActivityQualityWidget', () => {
    expect(source).toContain('ActivityQualityWidget');
  });

  it('includes SelfBenchmarkWidget', () => {
    expect(source).toContain('SelfBenchmarkWidget');
  });

  // === Engagement widgets ===
  it('includes MoodTrackerWidget', () => {
    expect(source).toContain('MoodTrackerWidget');
  });

  it('includes PulseSurveyWidget', () => {
    expect(source).toContain('PulseSurveyWidget');
  });

  it('includes DailyQuizWidget', () => {
    expect(source).toContain('DailyQuizWidget');
  });

  // === Skeleton/loading ===
  it('uses SkeletonTransition', () => {
    expect(source).toContain('SkeletonTransition');
  });

  it('uses DashboardLoadingSkeleton', () => {
    expect(source).toContain('DashboardLoadingSkeleton');
  });

  it('uses PageTransition', () => {
    expect(source).toContain('PageTransition');
  });

  // === Realtime ===
  it('uses useSalesRealtime', () => {
    expect(source).toContain('useSalesRealtime');
  });

  // === Responsive grid ===
  it('hero KPIs use 5-col grid on desktop', () => {
    expect(source).toContain('lg:grid-cols-5');
  });

  it('hero revenue spans 2 columns', () => {
    expect(source).toContain('col-span-2');
  });

  // === Currency formatting ===
  it('formats currency in pt-BR', () => {
    expect(source).toContain('pt-BR');
  });

  it('uses R$ prefix', () => {
    expect(source).toContain('R$');
  });

  // === Section teasers ===
  it('Performance section has teaser text', () => {
    expect(source).toContain('Score de Velocidade');
  });

  it('Engagement section has teaser text', () => {
    expect(source).toContain('Registre seu humor');
  });
});
