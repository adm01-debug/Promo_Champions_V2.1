/**
 * Fonte unica de verdade para o conteudo indexado pelo indice semantico.
 * Usado por `semantic-index-entity` (uma entidade) e `semantic-reindex-batch`
 * (lote in-process), garantindo que ambos produzam texto/hash identicos.
 */

export type SemanticEntityType =
  | 'client'
  | 'lead'
  | 'deal'
  | 'activity'
  | 'call_recording'
  | 'note'
  | 'email_message'
  | 'whatsapp_message'
  | 'proposal'
  | 'task'
  | 'playbook'
  | 'product';

export const SEMANTIC_TABLE_BY_TYPE: Record<
  SemanticEntityType,
  { table: string; ownerCol: string | null; statusFilter?: string[] }
> = {
  client: { table: 'clients', ownerCol: null },
  lead: { table: 'sales', ownerCol: 'salesperson_id', statusFilter: ['lead', 'prospecting', 'qualified'] },
  deal: {
    table: 'sales',
    ownerCol: 'salesperson_id',
    statusFilter: [
      'pending',
      'proposal',
      'negotiation',
      'closed',
      'won',
      'lost',
      'completed',
      'cancelled',
    ],
  },
  activity: { table: 'activities', ownerCol: 'salesperson_id' },
  call_recording: { table: 'call_recordings', ownerCol: 'salesperson_id' },
  note: { table: 'notes', ownerCol: 'user_id' },
  email_message: { table: 'email_messages', ownerCol: 'salesperson_id' },
  whatsapp_message: { table: 'whatsapp_messages', ownerCol: 'salesperson_id' },
  proposal: { table: 'proposals', ownerCol: 'salesperson_id' },
  task: { table: 'tasks', ownerCol: 'salesperson_id' },
  playbook: { table: 'playbooks', ownerCol: null },
  product: { table: 'products', ownerCol: null },
};

export function buildSemanticContent(
  type: SemanticEntityType,
  row: Record<string, unknown>,
): string {
  const j = (xs: unknown[]) => xs.filter(Boolean).join(' • ');
  switch (type) {
    case 'client':
      return j([row.name, row.email, row.phone, row.company, row.notes, row.industry, row.address]);
    case 'lead':
    case 'deal':
      return j([
        row.client_name,
        row.product_name,
        row.category,
        row.source,
        row.notes,
        row.email,
        row.phone,
        row.amount ? `R$${row.amount}` : null,
        row.status,
      ]);
    case 'activity':
      return j([row.activity_type, row.contact_name, row.notes, row.outcome]);
    case 'call_recording':
      return j([
        row.title,
        row.summary,
        row.transcript,
        (row.key_topics as string[] | undefined)?.join(', '),
      ]);
    case 'note':
      return j([row.title, row.content, row.body]);
    case 'email_message':
      return j([row.subject, row.from_email, row.to_email, row.body_text, row.snippet]);
    case 'whatsapp_message':
      return j([row.from_number, row.to_number, row.body, row.message_text]);
    case 'proposal':
      return j([
        row.title,
        row.client_name,
        row.summary,
        row.content,
        row.notes,
        row.amount ? `R$${row.amount}` : null,
      ]);
    case 'task':
      return j([row.title, row.description, row.status, row.priority]);
    case 'playbook':
      return j([row.name, row.title, row.description, row.content, row.stage]);
    case 'product':
      return j([
        row.name,
        row.category,
        row.sku,
        row.description as string,
        row.price ? `R$${row.price}` : null,
      ]);
    default:
      return '';
  }
}

export async function sha256HexText(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}