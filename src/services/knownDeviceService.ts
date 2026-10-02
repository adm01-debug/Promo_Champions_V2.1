import { supabase } from '@/integrations/supabase/client';

export const knownDeviceService = {
  async listForUser(userId: string) {
    const { data, error } = await supabase
      .from('known_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async setTrusted(deviceId: string, isTrusted: boolean) {
    const { error } = await supabase
      .from('known_devices')
      .update({ is_trusted: isTrusted })
      .eq('id', deviceId);
    if (error) throw error;
  },

  async remove(deviceId: string) {
    const { error } = await supabase.from('known_devices').delete().eq('id', deviceId);
    if (error) throw error;
  },
};
