/**
 * ROI Dashboard Logic Tests
 * Tests: ROI calculation, CAC, LTV, payback period, summary metrics
 */
import { describe, it, expect } from 'vitest';

describe('ROI Calculation', () => {
  const calculateROI = (revenue: number, cost: number): number => {
    if (cost <= 0) return 0;
    return ((revenue - cost) / cost) * 100;
  };

  it('should return positive ROI for profitable scenarios', () => {
    expect(calculateROI(200000, 100000)).toBe(100);
  });

  it('should return negative ROI for unprofitable', () => {
    expect(calculateROI(50000, 100000)).toBe(-50);
  });

  it('should return 0 for breakeven', () => {
    expect(calculateROI(100000, 100000)).toBe(0);
  });

  it('should handle zero cost', () => {
    expect(calculateROI(50000, 0)).toBe(0);
  });
});

describe('CAC - Customer Acquisition Cost', () => {
  const calculateCAC = (totalCost: number, wonDeals: number): number => {
    return wonDeals > 0 ? totalCost / wonDeals : 0;
  };

  it('should calculate cost per acquired customer', () => {
    expect(calculateCAC(50000, 10)).toBe(5000);
  });

  it('should handle zero deals', () => {
    expect(calculateCAC(50000, 0)).toBe(0);
  });

  it('should handle single deal', () => {
    expect(calculateCAC(10000, 1)).toBe(10000);
  });
});

describe('LTV - Lifetime Value', () => {
  const calculateLTV = (avgDealSize: number, repeatFactor: number = 2.5): number => {
    return avgDealSize * repeatFactor;
  };

  it('should apply repeat factor', () => {
    expect(calculateLTV(10000)).toBe(25000);
  });

  it('should handle custom repeat factor', () => {
    expect(calculateLTV(10000, 3)).toBe(30000);
  });

  it('should handle zero deal size', () => {
    expect(calculateLTV(0)).toBe(0);
  });
});

describe('Payback Period', () => {
  const calculatePayback = (cost: number, revenuePerDay: number): number => {
    return revenuePerDay > 0 ? Math.round(cost / revenuePerDay) : 999;
  };

  it('should calculate days to recover cost', () => {
    expect(calculatePayback(10000, 1000)).toBe(10);
  });

  it('should return 999 for zero daily revenue', () => {
    expect(calculatePayback(10000, 0)).toBe(999);
  });

  it('should handle small daily revenue', () => {
    expect(calculatePayback(30000, 100)).toBe(300);
  });
});

describe('Revenue Per Day', () => {
  const calculateRevenuePerDay = (totalRevenue: number, periodMonths: number): number => {
    const days = periodMonths * 30;
    return days > 0 ? totalRevenue / days : 0;
  };

  it('should calculate daily rate', () => {
    expect(calculateRevenuePerDay(90000, 3)).toBe(1000);
  });

  it('should handle single month', () => {
    expect(calculateRevenuePerDay(30000, 1)).toBe(1000);
  });

  it('should handle zero revenue', () => {
    expect(calculateRevenuePerDay(0, 3)).toBe(0);
  });
});

describe('Estimated Cost', () => {
  const calculateEstimatedCost = (baseSalary: number, months: number, commissionPaid: number): number => {
    return baseSalary * months + commissionPaid;
  };

  it('should sum salary and commissions', () => {
    expect(calculateEstimatedCost(3500, 3, 5000)).toBe(15500);
  });

  it('should handle zero commission', () => {
    expect(calculateEstimatedCost(3500, 3, 0)).toBe(10500);
  });
});

describe('Commission Calculation', () => {
  const calculateCommission = (revenue: number, rate: number): number => {
    return revenue * rate;
  };

  it('should calculate 10% commission', () => {
    expect(calculateCommission(100000, 0.1)).toBe(10000);
  });

  it('should calculate 5% commission', () => {
    expect(calculateCommission(100000, 0.05)).toBe(5000);
  });

  it('should handle zero revenue', () => {
    expect(calculateCommission(0, 0.1)).toBe(0);
  });
});

describe('Conversion Rate', () => {
  const calculateConversionRate = (wonDeals: number, totalDeals: number): number => {
    return totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
  };

  it('should calculate percentage', () => {
    expect(calculateConversionRate(5, 20)).toBe(25);
  });

  it('should handle zero total', () => {
    expect(calculateConversionRate(0, 0)).toBe(0);
  });

  it('should handle 100% conversion', () => {
    expect(calculateConversionRate(10, 10)).toBe(100);
  });
});

describe('Revenue Per Activity', () => {
  const calculateRevenuePerActivity = (revenue: number, activities: number): number => {
    return activities > 0 ? revenue / activities : 0;
  };

  it('should calculate revenue per activity', () => {
    expect(calculateRevenuePerActivity(100000, 200)).toBe(500);
  });

  it('should handle zero activities', () => {
    expect(calculateRevenuePerActivity(50000, 0)).toBe(0);
  });
});

describe('ROI Summary', () => {
  const calculateOverallROI = (totalRevenue: number, totalCosts: number): number => {
    return totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;
  };

  const calculateAvg = (values: number[]): number => {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  it('should calculate overall ROI', () => {
    expect(calculateOverallROI(500000, 200000)).toBe(150);
  });

  it('should average values', () => {
    expect(calculateAvg([100, 200, 300])).toBe(200);
    expect(calculateAvg([])).toBe(0);
  });
});
