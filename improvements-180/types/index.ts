export interface Deal {
  id: string;
  title: string;
  value: number;
  status: 'open' | 'won' | 'lost';
}
export interface Client {
  id: string;
  name: string;
  email?: string;
}
