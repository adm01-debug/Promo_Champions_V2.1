export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  cnpj: string | null;
  category: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  reliability_score: number | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
