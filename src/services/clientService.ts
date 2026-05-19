import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return (data || []) as Client[];
  },

  async createClient(input: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...input, user_id: input.user_id || user?.id };
    const { data, error } = await supabase.from('clients').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: any) {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};
