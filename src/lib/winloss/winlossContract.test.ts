/**
 * Teste de contrato front/edge: garante que os adaptadores/mirrors do frontend
 * (src/lib/winloss/*) e a implementação da edge
 * (supabase/functions/detect-winloss-at-risk/scoring.ts) produzem o mesmo
 * comportamento — via o módulo compartilhado _shared/winloss-contract.ts.
 */
import { describe, expect, it } from 'vitest';

// Lado "edge": o módulo que a function realmente executa.
import * as edge from '../../../supabase/functions/detect-winloss-at-risk/scoring';
// Lado "contrato": fonte única de verdade.
import * as contract from '../../../supabase/functions/_shared/winloss-contract';
// Lado "front": adaptadores/mirrors de src/lib.
import { deriveSeverity, summarizeActionMatrix, SEVERITY_RULES } from './riskSeverity';
import { severityFromScore as frontSeverityFromScore } from './severityFromScore';
import { RISK_REASON_CODES, RISK_REASON_LABELS, isRiskReasonCode } from './riskReasons';

const SCORES = [0, 10, 49, 50, 64, 65, 79, 80, 90, 100];
const CONFS = [0, 0.3, 0.5, 0.69, 0.7, 1];

describe('contrato front/edge — severity', () => {
  it('deriveSeverity (front) === severityFromScore (edge) para toda a grade', () => {
    for (const score of SCORES) {
      for (const conf of CONFS) {
        expect(deriveSeverity(score, conf)).toBe(edge.severityFromScore(score, conf));
      }
    }
    expect(deriveSeverity(85, null)).toBe(edge.severityFromScore(85, null));
    expect(deriveSeverity(85, undefined)).toBe(edge.severityFromScore(85, undefined));
  });

  it('adapter score-only do front (conf=1) === edge com conf plena', () => {
    for (const score of SCORES) {
      expect(frontSeverityFromScore(score)).toBe(edge.severityFromScore(score, 1));
    }
  });

  it('SEVERITY_RULES (tabela UI) bate com o contrato em toda a grade', () => {
    for (const score of SCORES) {
      for (const conf of CONFS) {
        const c = Math.max(0, Math.min(1, conf));
        const byRules = SEVERITY_RULES.find(r => r.matches(score, c))?.severity ?? 'low';
        expect(byRules).toBe(contract.severityFromScore(score, conf));
      }
    }
  });
});

describe('contrato front/edge — reason codes', () => {
  it('RISK_REASON_CODES do front são os códigos do contrato', () => {
    expect(RISK_REASON_CODES).toEqual(contract.RISK_REASON_CODES);
    expect(edge.RISK_REASON_CODES).toEqual(contract.RISK_REASON_CODES);
  });

  it('RISK_REASON_LABELS do front são os labels do contrato', () => {
    expect(RISK_REASON_LABELS).toEqual(contract.RISK_REASON_LABELS);
  });

  it('isRiskReasonCode aceita exatamente os códigos do contrato', () => {
    for (const code of contract.RISK_REASON_CODES) {
      expect(isRiskReasonCode(code)).toBe(true);
    }
    expect(isRiskReasonCode('NAO_EXISTE')).toBe(false);
    expect(isRiskReasonCode('')).toBe(false);
  });
});

describe('contrato front/edge — matriz de ações', () => {
  const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

  it('summarizeActionMatrix classifica o ramo que suggestedActionFor executa', () => {
    // win-override: pattern win_factor ou outcome won → frase positiva única.
    expect(edge.suggestedActionFor('win_factor', 'negotiation', { severity: 'high' }))
      .toBe(contract.WIN_OVERRIDE_ACTION);
    expect(edge.suggestedActionFor('loss_factor', 'negotiation', { severity: 'critical', outcome: 'won' }))
      .toBe(contract.WIN_OVERRIDE_ACTION);
    for (const sev of SEVERITIES) {
      expect(summarizeActionMatrix('win_factor', sev).kind).toBe('win-override');
      expect(summarizeActionMatrix('loss_factor', sev, 'won').kind).toBe('win-override');
    }

    // matrix: tipos canônicos produzem frases do próprio ramo (≠ override, ≠ default).
    const defaultPhrase = edge.suggestedActionFor('outro_tipo', 'x', { severity: 'medium' });
    for (const type of ['loss_factor', 'stuck_stage', 'competitor']) {
      for (const sev of SEVERITIES) {
        const action = edge.suggestedActionFor(type, 'negotiation', { severity: sev });
        expect(action).not.toBe(contract.WIN_OVERRIDE_ACTION);
        expect(action).not.toBe(defaultPhrase);
        expect(summarizeActionMatrix(type, sev).kind).toBe('matrix');
      }
    }

    // default-fallback: tipo fora do conjunto canônico cai no ramo default.
    for (const sev of SEVERITIES) {
      const action = edge.suggestedActionFor('outro_tipo', 'x', { severity: sev });
      expect(action).toBe(edge.suggestedActionFor('qualquer', 'x', { severity: sev }));
      expect(summarizeActionMatrix('outro_tipo', sev).kind).toBe('default-fallback');
      expect(summarizeActionMatrix(null, sev).kind).toBe('default-fallback');
    }
  });

  it('CANONICAL_PATTERN_TYPES cobre exatamente os ramos da edge', () => {
    expect([...contract.CANONICAL_PATTERN_TYPES].sort()).toEqual(
      ['competitor', 'loss_factor', 'stuck_stage', 'win_factor'].sort()
    );
  });
});

describe('contrato front/edge — limiares e status traváveis', () => {
  it('limiares canônicos expostos pelo contrato', () => {
    expect(contract.SEVERITY_CRITICAL_MIN).toBe(80);
    expect(contract.SEVERITY_HIGH_MIN).toBe(65);
    expect(contract.SEVERITY_MEDIUM_MIN).toBe(50);
    expect(contract.CRITICAL_CONFIDENCE_MIN).toBe(0.7);
    expect(contract.DEAL_RISK_THRESHOLD).toBe(40);
  });

  it('STUCK_STATUSES do contrato (usado por stageMatchScore na edge)', () => {
    expect([...contract.STUCK_STATUSES].sort()).toEqual(
      ['negotiation', 'pending', 'proposal', 'qualified'].sort()
    );
    // a edge exporta o mesmo Set
    expect(edge.STUCK_STATUSES).toBe(contract.STUCK_STATUSES);
  });
});
