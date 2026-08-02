import { describe, expect, it } from 'vitest';

import {
  RECOVERY_RISK_THRESHOLD,
  campaignLabel,
  failureTypeLabel,
  formatRecoveryDuration,
  isPermanentFailureType,
  recoveryHealth,
  recoveryHealthVariant,
  sumRecovery,
} from './recoveryRateHelpers';

describe('failureTypeLabel', () => {
  it('traduz códigos conhecidos', () => {
    expect(failureTypeLabel('supressao')).toBe('Supressão / descadastro');
    expect(failureTypeLabel('limite_de_vazao')).toBe('Limite de vazão');
  });

  it('devolve o código bruto quando desconhecido', () => {
    expect(failureTypeLabel('novo_codigo')).toBe('novo_codigo');
  });
});

describe('isPermanentFailureType', () => {
  it('classifica falhas estruturais como permanentes', () => {
    for (const code of ['supressao', 'destinatario_ausente', 'endereco_invalido', 'hard_bounce']) {
      expect(isPermanentFailureType(code)).toBe(true);
    }
  });

  it('classifica falhas transitórias como recuperáveis', () => {
    for (const code of ['limite_de_vazao', 'rede_indisponivel', 'infra_remetente', 'outro']) {
      expect(isPermanentFailureType(code)).toBe(false);
    }
  });
});

describe('recoveryHealth', () => {
  it('marca falhas permanentes como esperado, independente da taxa', () => {
    expect(recoveryHealth('hard_bounce', 0)).toBe('esperado');
    expect(recoveryHealth('supressao', 100)).toBe('esperado');
  });

  it('usa o limiar para falhas transitórias', () => {
    expect(recoveryHealth('rede_indisponivel', RECOVERY_RISK_THRESHOLD)).toBe('ok');
    expect(recoveryHealth('rede_indisponivel', RECOVERY_RISK_THRESHOLD - 1)).toBe('atencao');
    expect(recoveryHealth('rede_indisponivel', RECOVERY_RISK_THRESHOLD / 2 - 1)).toBe('critico');
  });

  it('mapeia saúde para variantes semânticas', () => {
    expect(recoveryHealthVariant('critico')).toBe('destructive');
    expect(recoveryHealthVariant('atencao')).toBe('secondary');
    expect(recoveryHealthVariant('esperado')).toBe('outline');
    expect(recoveryHealthVariant('ok')).toBe('default');
  });
});

describe('formatRecoveryDuration', () => {
  it('cobre as faixas de tempo', () => {
    expect(formatRecoveryDuration(0)).toBe('—');
    expect(formatRecoveryDuration(-5)).toBe('—');
    expect(formatRecoveryDuration(Number.NaN)).toBe('—');
    expect(formatRecoveryDuration(0.4)).toBe('<1 min');
    expect(formatRecoveryDuration(12.6)).toBe('13 min');
    expect(formatRecoveryDuration(90)).toBe('1.5 h');
    expect(formatRecoveryDuration(60 * 36)).toBe('1.5 d');
  });
});

describe('sumRecovery', () => {
  it('retorna zeros para lista vazia (sem divisão por zero)', () => {
    expect(sumRecovery([])).toEqual({
      failedTotal: 0,
      recoveredCount: 0,
      stillFailing: 0,
      recoveryRate: 0,
    });
  });

  it('consolida linhas e calcula a taxa com 2 decimais', () => {
    const totals = sumRecovery([
      { failed_total: 3, recovered_count: 1, still_failing: 2 },
      { failed_total: 4, recovered_count: 3, still_failing: 1 },
    ]);
    expect(totals.failedTotal).toBe(7);
    expect(totals.recoveredCount).toBe(4);
    expect(totals.stillFailing).toBe(3);
    expect(totals.recoveryRate).toBeCloseTo(57.14, 2);
  });

  it('é estável em centenas de cenários aleatórios', () => {
    for (let i = 0; i < 500; i += 1) {
      const rows = Array.from({ length: (i % 7) + 1 }, (_, k) => {
        const recovered = (i + k) % 5;
        const failing = (i * k) % 4;
        return {
          failed_total: recovered + failing,
          recovered_count: recovered,
          still_failing: failing,
        };
      });
      const t = sumRecovery(rows);
      expect(t.failedTotal).toBe(t.recoveredCount + t.stillFailing);
      expect(t.recoveryRate).toBeGreaterThanOrEqual(0);
      expect(t.recoveryRate).toBeLessThanOrEqual(100);
    }
  });
});

describe('campaignLabel', () => {
  it('normaliza espaços e trata vazio', () => {
    expect(campaignLabel(null)).toBe('Campanha sem descrição');
    expect(campaignLabel('   ')).toBe('Campanha sem descrição');
    expect(campaignLabel('a\n  b')).toBe('a b');
  });

  it('trunca prompts longos', () => {
    expect(campaignLabel('x'.repeat(100))).toHaveLength(61);
  });
});
