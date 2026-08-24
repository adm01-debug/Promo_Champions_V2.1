import { describe, it, expect } from "vitest";
import { 
  buildSalespeoplePerformance, 
  computePipelineHealth, 
  computeForecast 
} from "../utils/bi-helpers";

describe("BI Helpers", () => {
  const mockSalespeople = [
    { id: "1", name: "John", avatar_url: null, role: "SDR" },
    { id: "2", name: "Jane", avatar_url: null, role: "Closer" }
  ];

  const mockCompletedSales = [
    { id: "s1", salesperson_id: "1", amount: 100, status: "completed", created_at: "2024-01-01T10:00:00Z" },
    { id: "s2", salesperson_id: "2", amount: 200, status: "completed", created_at: "2024-01-02T10:00:00Z" }
  ];

  const mockAllCurrentSales = [
    ...mockCompletedSales,
    { id: "s3", salesperson_id: "1", amount: 150, status: "pending", created_at: "2024-01-03T10:00:00Z" }
  ];

  const mockGoals = [
    { salesperson_id: "1", goal_amount: 1000 },
    { salesperson_id: "2", goal_amount: 2000 }
  ];

  const mockActivities = [
    { salesperson_id: "1", activity_type: "call", created_at: "2024-01-01T11:00:00Z" },
    { salesperson_id: "1", activity_type: "email", created_at: "2024-01-01T12:00:00Z" }
  ];

  it("buildSalespeoplePerformance should calculate correct metrics", () => {
    const performance = buildSalespeoplePerformance(
      mockSalespeople,
      mockCompletedSales,
      mockAllCurrentSales,
      mockGoals,
      mockActivities
    );

    expect(performance).toHaveLength(2);
    
    const john = performance.find(p => p.id === "1");
    expect(john?.revenue).toBe(100);
    expect(john?.deals).toBe(1);
    expect(john?.conversionRate).toBe((1/2) * 100);
    expect(john?.goalProgress).toBe((100/1000) * 100);
    expect(john?.activities).toBe(2);
  });

  it("computePipelineHealth should calculate health metrics", () => {
    const now = new Date("2024-01-20T10:00:00Z");
    const pipeline = [
      { id: "p1", amount: 500, status: "qualified", created_at: "2024-01-01T10:00:00Z" }, // > 14 days
      { id: "p2", amount: 300, status: "proposal", created_at: "2024-01-15T10:00:00Z" }   // < 14 days
    ];

    const health = computePipelineHealth(pipeline, now);

    expect(health.totalPipelineValue).toBe(800);
    expect(health.atRiskDeals).toBe(1);
    expect(health.avgDaysInPipeline).toBeGreaterThan(0);
    expect(health.dealsByStage.find(s => s.stage === "qualified")?.count).toBe(1);
  });

  it("computeForecast should calculate forecast metrics", () => {
    const pipeline = [
      { id: "p1", amount: 1000, status: "qualified", created_at: "2024-01-01T10:00:00Z" }, // 30% prob
      { id: "p2", amount: 1000, status: "negotiation", created_at: "2024-01-01T10:00:00Z" } // 80% prob
    ];

    const forecast = computeForecast(pipeline, 5000, 10000, 15, 15);

    expect(forecast.weightedForecast).toBe(1000 * 0.3 + 1000 * 0.8);
    expect(forecast.projectedRevenue).toBe(5000 + (5000 / 15) * 15);
    expect(forecast.confidenceLevel).toBeGreaterThan(0);
  });
});
