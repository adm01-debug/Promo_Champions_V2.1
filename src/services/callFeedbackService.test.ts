import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import { callFeedbackService } from './callFeedbackService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('callFeedbackService.submitCallFeedback', () => {
  it('insere evento call_feedback em lead_detailed_logs', async () => {
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ insert: insertMock });

    await callFeedbackService.submitCallFeedback({
      clientId: 'c-1',
      recordingId: 'r-1',
      score: 4,
      comment: 'boa ligação',
    });

    expect(fromMock).toHaveBeenCalledWith('lead_detailed_logs');
    expect(insertMock).toHaveBeenCalledWith({
      event_type: 'call_feedback',
      client_id: 'c-1',
      action: 'Manual Manager Feedback',
      details: { recording_id: 'r-1', score: 4, comment: 'boa ligação' },
    });
  });

  it('propaga erro do insert', async () => {
    insertMock.mockResolvedValue({ error: new Error('falha') });
    fromMock.mockReturnValue({ insert: insertMock });

    await expect(
      callFeedbackService.submitCallFeedback({
        clientId: null,
        recordingId: 'r-1',
        score: 1,
        comment: 'x',
      })
    ).rejects.toThrow('falha');
  });
});
