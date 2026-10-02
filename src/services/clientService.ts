import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";

/** Colunas usadas no card de cliente e no diálogo de edição. */
const CLIENT_LIST_COLUMNS =
  'id, name, email, phone, company, total_value, lead_source, lat, lng, created_at, updated_at';

export type ClientSortKey =
  | 'name_asc'
  | 'name_desc'
  | 'value_desc'
  | 'value_asc'
  | 'date_desc'
  | 'date_asc';

const CLIENT_SORT_COLUMNS: Record<ClientSortKey, { column: string; ascending: boolean }> = {
  name_asc: { column: 'name', ascending: true },
  name_desc: { column: 'name', ascending: false },
  value_desc: { column: 'total_value', ascending: false },
  value_asc: { column: 'total_value', ascending: true },
  date_desc: { column: 'created_at', ascending: false },
  date_asc: { column: 'created_at', ascending: true },
};

export interface ClientsPageQuery {
  search?: string;
  sortBy?: ClientSortKey;
  /** Página 1-based. */
  page?: number;
  pageSize?: number;
}

export interface ClientsPage {
  rows: Client[];
  total: number;
}

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return (data || []) as Client[];
  },

  async getClientsPage({
    search = '',
    sortBy = 'name_asc',
    page = 1,
    pageSize = 12,
  }: ClientsPageQuery = {}): Promise<ClientsPage> {
    let query = supabase
      .from('clients')
      .select(CLIENT_LIST_COLUMNS, { count: 'exact' });

    const term = search.trim().replace(/[,()*]/g, ' ');
    if (term) {
      query = query.or(
        `name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
      );
    }

    const sort = CLIENT_SORT_COLUMNS[sortBy] ?? CLIENT_SORT_COLUMNS.name_asc;
    const from = (Math.max(1, page) - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { rows: (data || []) as Client[], total: count ?? 0 };
  },

  /** Busca para o deep-link ?client360=<nome> — lookup direto, sem depender da página carregada. */
  async findClientByName(name: string): Promise<Client | null> {
    const term = name.trim();
    if (!term) return null;
    const { data, error } = await supabase
      .from('clients')
      .select(CLIENT_LIST_COLUMNS)
      .ilike('name', term)
      .limit(10);
    if (error) throw error;
    const rows = (data || []) as Client[];
    return (
      rows.find(c => c.name.trim().toLowerCase() === term.toLowerCase()) ?? null
    );
  },

  async createClient(input: Partial<Client> & Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...input, user_id: (input.user_id as string | undefined) || user?.id } as never;
    const { data, error } = await supabase.from('clients').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<Client> & Record<string, unknown>) {
    const { data, error } = await supabase.from('clients').update(updates as never).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};
