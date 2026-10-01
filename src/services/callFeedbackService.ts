import { supabase } from "@/integrations/supabase/client";

export const callFeedbackService = {
  async submitCallFeedback({
    clientId,
    recordingId,
    score,
    comment,
  }: {
    clientId: string | null | undefined;
    recordingId: string;
    score: number;
    comment: string;
  }) {
    const { error } = await supabase.from('lead_detailed_logs').insert({
      event_type: 'call_feedback',
      client_id: clientId as string,
      action: 'Manual Manager Feedback',
      details: {
        recording_id: recordingId,
        score,
        comment,
      },
    });
    if (error) throw error;
  },
};
