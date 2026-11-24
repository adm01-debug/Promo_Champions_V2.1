# public.deal_risk_signals

> Tabela public.deal_risk_signals. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, signal_type text NOT NULL, severity text NOT NULL, description text NOT NULL, detected_at timestamp with time zone NOT NULL DEFAULT now(), resolved_at timestamp with time zone NULLABLE, resolved_by uuid NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb. Relacionamentos FK: resolved_by → public.salespeople(id); sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_risk_signals. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_risk_signals. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `signal_type` | `text` | não |  |  | Coluna signal_type da tabela public.deal_risk_signals. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (signal_type = ANY (ARRAY['stagnation'::text, 'no_contact'::text, 'engagement_drop'::text, 'price_resistance'::text, 'competitor_mentioned'::text, 'single_threaded'::text, 'overdue_followup'::text])). |
| 4 | `severity` | `text` | não |  |  | Coluna severity da tabela public.deal_risk_signals. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])). |
| 5 | `description` | `text` | não |  |  | Coluna description da tabela public.deal_risk_signals. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `detected_at` | `timestamp with time zone` | não | `now()` |  | Coluna detected_at da tabela public.deal_risk_signals. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `resolved_at` | `timestamp with time zone` | sim |  |  | Coluna resolved_at da tabela public.deal_risk_signals. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 8 | `resolved_by` | `uuid` | sim |  |  | Coluna resolved_by da tabela public.deal_risk_signals. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 9 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.deal_risk_signals. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_risk_signals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_risk_signals_resolved_by_fkey | FOREIGN KEY | `FOREIGN KEY (resolved_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| deal_risk_signals_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_risk_signals_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| deal_risk_signals_signal_type_check | CHECK | `CHECK (signal_type = ANY (ARRAY['stagnation'::text, 'no_contact'::text, 'engagement_drop'::text, 'price_resistance'::text, 'competitor_mentioned'::text, 'single_threaded'::text, 'overdue_followup'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_risk_signals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_risk_signals_pkey ON public.deal_risk_signals USING btree (id)` |
| idx_deal_risk_signals_resolved_by | btree | resolved_by | não | sim |  | `CREATE INDEX idx_deal_risk_signals_resolved_by ON public.deal_risk_signals USING btree (resolved_by)` |
| idx_risk_signals_sale | btree | sale_id, detected_at | não | sim |  | `CREATE INDEX idx_risk_signals_sale ON public.deal_risk_signals USING btree (sale_id, detected_at DESC)` |
| idx_risk_signals_unresolved | btree | severity, detected_at | não | sim | `(resolved_at IS NULL)` | `CREATE INDEX idx_risk_signals_unresolved ON public.deal_risk_signals USING btree (severity, detected_at DESC) WHERE (resolved_at IS NULL)` |


## Policies (RLS)

### `Insert risk signals for accessible sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(( SELECT is_admin_or_manager(( SELECT auth.uid() AS uid)) AS is_admin_or_manager) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND (s.salesperson_id = ( SELECT get_current_salesperson_id() AS get_current_salesperson_id))))))` |

### `Owners resolve own signals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |

### `View signals via sale access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
