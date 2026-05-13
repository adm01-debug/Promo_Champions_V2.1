import { z } from "zod";

export const GoalSchema = z.object({
  amount: z.number().min(0),
});

export const RuleSchema = z.object({
  weight: z.number().min(0).max(10),
  points_per_unit: z.number().min(0),
  label: z.string().min(1),
});

export const CommissionSchema = z.object({
  rate: z.number().min(0).max(100),
});

export const ApprovalRequestSchema = z.object({
  type: z.enum(["goal", "scoring_rule", "commission"]),
  entity_id: z.string().uuid(),
  new_values: z.record(z.any()),
  old_values: z.record(z.any()).optional(),
  justification: z.string().optional(),
});
