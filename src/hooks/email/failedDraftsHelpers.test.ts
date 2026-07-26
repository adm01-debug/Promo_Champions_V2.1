import { describe, expect, it } from 'vitest';
import {
  classifyDraft,
  humanizeError,
  isPermanentError,
  MAX_RETRIES,
  statusLabel,
  summarize,
  type FailedDraftLike,
} from './failedDraftsHelpers';

const NOW = new Date('2026-07-26T12:00:00.000Z');

function draft(over: Partial<FailedDraftLike> = {}): FailedDraftLike {
  return { id: 'd1', error: 'connection reset', retry_count: 0, next_retry_at: null, ...over };
}

describe('isPermanentError', () => {
  it('não classifica ausência de erro como permanente', () => {
    expect(isPermanentError(null)).toBe(false);
    expect(isPermanentError('')).toBe(false);
  });

  it.each([
    'opted_out',
    'missing_recipient_email',
    'address suppressed by provider',
    'hard-bounce detected',
    'SMTP 5.1.1 user unknown',
    'sender_not_configured',
    'invalid_recipient',
    'mailbox does not exist',
  ])('marca "%s" como permanente', (msg) => {
    expect(isPermanentError(msg)).toBe(true);
  });

  it.each(['429 rate limit', 'timeout', 'ECONNRESET'])(
    'mantém "%s" como transitório',
    (msg) => {
      expect(isPermanentError(msg)).toBe(false);
    },
  );
});

describe('classifyDraft', () => {
  it('prioriza erro permanente sobre agendamento', () => {
    expect(
      classifyDraft(draft({ error: 'opted_out', next_retry_at: '2099-01-01T00:00:00Z' }), NOW),
    ).toBe('permanent');
  });

  it('detecta tentativas esgotadas', () => {
    expect(classifyDraft(draft({ retry_count: MAX_RETRIES }), NOW)).toBe('exhausted');
    expect(classifyDraft(draft({ retry_count: MAX_RETRIES + 3 }), NOW)).toBe('exhausted');
  });

  it('reconhece reenvio agendado no futuro', () => {
    expect(classifyDraft(draft({ next_retry_at: '2026-07-26T13:00:00.000Z' }), NOW)).toBe(
      'scheduled',
    );
  });

  it('trata agendamento vencido como pendente', () => {
    expect(classifyDraft(draft({ next_retry_at: '2026-07-26T11:59:59.000Z' }), NOW)).toBe('pending');
  });

  it('trata ausência de agendamento como pendente', () => {
    expect(classifyDraft(draft(), NOW)).toBe('pending');
  });
});

describe('summarize', () => {
  it('retorna zeros para lista vazia', () => {
    expect(summarize([], NOW)).toEqual({
      total: 0,
      permanent: 0,
      exhausted: 0,
      scheduled: 0,
      pending: 0,
      actionable: 0,
    });
  });

  it('agrega centenas de rascunhos de forma consistente', () => {
    const drafts: FailedDraftLike[] = [];
    for (let i = 0; i < 400; i++) {
      const mod = i % 4;
      drafts.push(
        draft({
          id: `d${i}`,
          error: mod === 0 ? 'opted_out' : 'provider unavailable',
          retry_count: mod === 1 ? MAX_RETRIES : 1,
          next_retry_at: mod === 2 ? '2026-07-26T18:00:00.000Z' : null,
        }),
      );
    }
    const s = summarize(drafts, NOW);
    expect(s.total).toBe(400);
    expect(s.permanent).toBe(100);
    expect(s.exhausted).toBe(100);
    expect(s.scheduled).toBe(100);
    expect(s.pending).toBe(100);
    expect(s.actionable).toBe(200);
    expect(s.permanent + s.exhausted + s.scheduled + s.pending).toBe(s.total);
  });
});

describe('humanizeError', () => {
  it('trata erro nulo', () => {
    expect(humanizeError(null)).toBe('Erro não informado');
  });

  it('traduz padrões conhecidos', () => {
    expect(humanizeError('opted_out')).toMatch(/descadastro/i);
    expect(humanizeError('429 too many requests')).toMatch(/limite/i);
    expect(humanizeError('SMTP 5.1.1')).toMatch(/hard bounce/i);
  });

  it('trunca mensagens muito longas', () => {
    const long = 'x'.repeat(500);
    expect(humanizeError(long).length).toBeLessThanOrEqual(141);
  });
});

describe('statusLabel', () => {
  it('cobre todos os estados', () => {
    for (const s of ['permanent', 'exhausted', 'scheduled', 'pending'] as const) {
      expect(statusLabel(s)).toBeTruthy();
    }
  });
});
