import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .is('deleted_at', null);
    if (error) throw error;
    return (data || []) as Client[];
  },

  async createClient(input: Partial<Client> & Record<string, unknown>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const payload = {
      ...input,
      user_id: (input.user_id as string | undefined) || user?.id,
    } as never;
    const { data, error } = await supabase
      .from('clients')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<Client> & Record<string, unknown>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null })
      .eq('id', id);
    if (error) throw error;
  },

  async importClients(
    records: {
      name: string;
      email: string | null;
      phone: string | null;
      company: string | null;
    }[]
  ) {
    const { error } = await supabase.from('clients').insert(records);
    if (error) throw error;
  },

  async getClientsForExport() {
    const { data, error } = await supabase
      .from('clients')
      .select('name, email, phone, company, total_value')
      .limit(1000);
    if (error) throw error;
    return data || [];
  },

  async mergeClients({
    targetId,
    duplicateIds,
    preferredFields,
  }: {
    targetId: string;
    duplicateIds: string[];
    preferredFields: Record<string, string>;
  }) {
    const { error } = await supabase.rpc('merge_clients', {
      target_id: targetId,
      duplicate_ids: duplicateIds,
      preferred_fields: preferredFields,
    });
    if (error) throw error;
  },
};
