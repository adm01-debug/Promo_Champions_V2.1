/**
 * Factories compartilhadas de teste — builders tipados para as entidades mais
 * usadas nas specs. Cada builder devolve uma linha/objeto completo e válido;
 * sobrescreva só os campos relevantes ao cenário:
 *
 *   const vendaGanha = buildSale({ status: 'completed', amount: 1200 });
 *
 * Convenções:
 * - IDs determinísticos via contador interno (stubs estáveis, sem faker);
 * - datas fixas por padrão — testes dependentes de "hoje" sobrescrevem;
 * - campos nullable começam em null: quem precisa deles os declara no override,
 *   mantendo o diff do teste legível.
 */
import type { TableRow } from '@/lib/supabase/typed-payloads';
import type { Client, Deal, User } from '@/types';

/**
 * Overrides relaxados: toda chave é opcional e aceita `null`, mesmo quando a
 * coluna do banco é NOT NULL — specs que exercitam código defensivo
 * (serializadores, mapeadores) precisam injetar `null` sem cast.
 */
type Over<T> = { [K in keyof T]?: T[K] | null };

let seq = 0;

/** ID determinístico único por execução de teste. */
export function nextTestId(prefix = 'test'): string {
  seq += 1;
  return `${prefix}-${String(seq).padStart(4, '0')}`;
}

export function nextUuid(): string {
  seq += 1;
  return `00000000-0000-4000-8000-${String(seq).padStart(12, '0')}`;
}

const BASE_TS = '2026-01-15T10:00:00.000Z';

// ---------------------------------------------------------------------------
// Linhas do schema público (tipos gerados em src/integrations/supabase/types.ts)
// ---------------------------------------------------------------------------

export function buildSale(over: Over<TableRow<'sales'>> = {}): TableRow<'sales'> {
  return {
    account_id: null,
    ai_prediction_reasoning: null,
    ai_prediction_score: null,
    amount: 1000,
    broadcast_sent_at: null,
    category: 'one-time',
    client_id: null,
    client_name: 'Cliente Teste',
    closed_at: null,
    closer_id: null,
    competitor_name: null,
    competitor_price_at_deal: null,
    cost_source: null,
    cost_synced_at: null,
    created_at: BASE_TS,
    deal_status: null,
    enrichment_data: null,
    enrichment_status: null,
    forecast_category: null,
    id: nextUuid(),
    is_first_sale: null,
    loss_reason: null,
    lost_to_competitor_id: null,
    margin_amount: null,
    markup_pct: null,
    notes: null,
    pipeline_id: null,
    product_id: null,
    product_name: 'Produto Teste',
    salesperson_id: null,
    script_variant: null,
    sdr_id: null,
    segment: null,
    sku: null,
    source: null,
    stage: null,
    status: 'pending',
    stock_reduced: null,
    territory_id: null,
    total_cost: null,
    unit_cost: null,
    updated_at: BASE_TS,
    whatsapp_last_interaction: null,
    whatsapp_status: null,
    ...over,
  } as TableRow<'sales'>;
}

export function buildClient(over: Over<TableRow<'clients'>> = {}): TableRow<'clients'> {
  return {
    activated_at: null,
    company: null,
    created_at: BASE_TS,
    delete_reason: null,
    deleted_at: null,
    deleted_by: null,
    email: null,
    email_verified: null,
    id: nextUuid(),
    is_activated: null,
    last_enrichment_id: null,
    last_interaction_at: null,
    lat: null,
    lead_source: null,
    lng: null,
    name: 'Cliente Teste',
    phone: null,
    phone_verified: null,
    ramo_atividade: null,
    total_value: 0,
    updated_at: BASE_TS,
    user_id: null,
    ...over,
  } as TableRow<'clients'>;
}

export function buildQuote(over: Over<TableRow<'quotes'>> = {}): TableRow<'quotes'> {
  return {
    approved_at: null,
    billing_status: null,
    client_email: null,
    client_id: null,
    client_name: 'Cliente Teste',
    client_phone: null,
    contract_end_date: null,
    contract_start_date: null,
    created_at: BASE_TS,
    created_by: null,
    currency: 'BRL',
    description: null,
    discount_amount: null,
    discount_percent: null,
    exchange_rate: null,
    external_quote_id: null,
    external_reference: null,
    external_seller_id: null,
    id: nextUuid(),
    items: null,
    last_synced_at: null,
    notes: null,
    pdf_url: null,
    quote_number: null,
    rejected_at: null,
    rejection_reason: null,
    sale_id: null,
    seller_name: null,
    sent_at: null,
    source: null,
    status: 'draft',
    subscription_type: null,
    subtotal: null,
    sync_status: null,
    synced_from_external: null,
    title: 'Cotação Teste',
    total_value: 1000,
    updated_at: BASE_TS,
    valid_until: null,
    ...over,
  } as TableRow<'quotes'>;
}

export function buildSalesperson(
  over: Over<TableRow<'salespeople'>> = {},
): TableRow<'salespeople'> {
  return {
    auth_user_id: null,
    avatar_url: null,
    commission_rate: 5,
    created_at: BASE_TS,
    email: null,
    id: nextUuid(),
    is_active: true,
    name: 'Vendedor Teste',
    notify_sales_email: null,
    notify_sales_in_app: null,
    role: 'closer',
    score_total: 0,
    squad_id: null,
    updated_at: BASE_TS,
    ...over,
  } as TableRow<'salespeople'>;
}

export function buildCommission(
  over: Over<TableRow<'commissions'>> = {},
): TableRow<'commissions'> {
  return {
    approved_at: null,
    approved_by: null,
    base_amount: 1000,
    commission_amount: 50,
    created_at: BASE_TS,
    id: nextUuid(),
    is_first_sale: null,
    paid_at: null,
    paid_by: null,
    payment_notes: null,
    percentage: 5,
    rule_id: null,
    sale_id: nextUuid(),
    salesperson_id: nextUuid(),
    sdr_commission_amount: null,
    status: 'pending',
    updated_at: BASE_TS,
    ...over,
  } as TableRow<'commissions'>;
}

// ---------------------------------------------------------------------------
// Tipos de domínio do frontend (src/types)
// ---------------------------------------------------------------------------

export function buildDeal(over: Over<Deal> = {}): Deal {
  return {
    id: nextTestId('deal'),
    title: 'Deal Teste',
    value: 1000,
    client_id: nextTestId('client'),
    stage_id: 'stage-1',
    status: 'open',
    probability: 20,
    assigned_to: nextTestId('user'),
    created_at: BASE_TS,
    updated_at: BASE_TS,
    ...over,
  } as Deal;
}

export function buildUser(over: Over<User> = {}): User {
  const id = nextTestId('user');
  return {
    id,
    email: `${id}@promobrindes.test`,
    role: 'sales_rep',
    created_at: BASE_TS,
    is_active: true,
    ...over,
  } as User;
}

export function buildDomainClient(over: Over<Client> = {}): Client {
  return {
    id: nextTestId('client'),
    name: 'Cliente Teste',
    created_at: BASE_TS,
    updated_at: BASE_TS,
    ...over,
  } as Client;
}
