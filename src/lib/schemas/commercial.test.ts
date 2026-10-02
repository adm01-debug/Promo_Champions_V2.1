import { describe, it, expect } from 'vitest';
import {
  GoalSchema,
  RuleSchema,
  CommissionSchema,
  ApprovalRequestSchema,
} from './commercial';

describe('GoalSchema', () => {
  it('aceita meta com valor positivo ou zero', () => {
    expect(GoalSchema.safeParse({ amount: 0 }).success).toBe(true);
    expect(GoalSchema.safeParse({ amount: 150000.5 }).success).toBe(true);
  });

  it('rejeita meta negativa ou não numérica', () => {
    expect(GoalSchema.safeParse({ amount: -1 }).success).toBe(false);
    expect(GoalSchema.safeParse({ amount: 'mil' }).success).toBe(false);
    expect(GoalSchema.safeParse({}).success).toBe(false);
  });
});

describe('RuleSchema', () => {
  const valid = { weight: 5, points_per_unit: 10, label: 'Ligação' };

  it('aceita regra válida nos limites do peso (0 e 10)', () => {
    expect(RuleSchema.safeParse({ ...valid, weight: 0 }).success).toBe(true);
    expect(RuleSchema.safeParse({ ...valid, weight: 10 }).success).toBe(true);
  });

  it('rejeita peso acima de 10 ou negativo', () => {
    expect(RuleSchema.safeParse({ ...valid, weight: 10.01 }).success).toBe(false);
    expect(RuleSchema.safeParse({ ...valid, weight: -1 }).success).toBe(false);
  });

  it('rejeita pontos negativos e label vazio', () => {
    expect(RuleSchema.safeParse({ ...valid, points_per_unit: -0.5 }).success).toBe(false);
    expect(RuleSchema.safeParse({ ...valid, label: '' }).success).toBe(false);
  });
});

describe('CommissionSchema', () => {
  it('aceita taxa dentro de 0–100', () => {
    expect(CommissionSchema.safeParse({ rate: 0 }).success).toBe(true);
    expect(CommissionSchema.safeParse({ rate: 7.5 }).success).toBe(true);
    expect(CommissionSchema.safeParse({ rate: 100 }).success).toBe(true);
  });

  it('rejeita taxa fora de 0–100 — comissão nunca é negativa nem > 100%', () => {
    expect(CommissionSchema.safeParse({ rate: -0.1 }).success).toBe(false);
    expect(CommissionSchema.safeParse({ rate: 100.01 }).success).toBe(false);
    expect(CommissionSchema.safeParse({}).success).toBe(false);
  });
});

describe('ApprovalRequestSchema', () => {
  const uuid = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
  const valid = {
    type: 'commission',
    entity_id: uuid,
    new_values: { rate: 5 },
  };

  it('aceita os três tipos de entidade', () => {
    for (const type of ['goal', 'scoring_rule', 'commission']) {
      expect(ApprovalRequestSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
  });

  it('rejeita tipo desconhecido e entity_id não-UUID', () => {
    expect(ApprovalRequestSchema.safeParse({ ...valid, type: 'bonus' }).success).toBe(
      false
    );
    expect(ApprovalRequestSchema.safeParse({ ...valid, entity_id: 'abc' }).success).toBe(
      false
    );
  });

  it('new_values é obrigatório; old_values e justification são opcionais', () => {
    expect(
      ApprovalRequestSchema.safeParse({ type: 'goal', entity_id: uuid }).success
    ).toBe(false);
    expect(
      ApprovalRequestSchema.safeParse({
        ...valid,
        old_values: { rate: 3 },
        justification: 'reajuste trimestral',
      }).success
    ).toBe(true);
  });
});
