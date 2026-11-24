# public.deal_health_scores

> Tabela public.deal_health_scores. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, health_score integer NOT NULL, health_label text NOT NULL, positive_factors jsonb NULLABLE DEFAULT '[]'::jsonb, negative_factors jsonb NULLABLE DEFAULT '[]'::jsonb, ai_recommendation text NULLABLE, computed_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), owner_id uuid NULLABLE, tier text NOT NULL DEFAULT 'watch'::text, factors jsonb NOT NULL DEFAULT '[]'::jsonb, recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb, last_activity_at timestamp with time zone NULLABLE, days_in_stage integer NULLABLE DEFAULT 0, updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_health_scores. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_health_scores. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `health_score` | `integer` | não |  |  | Coluna health_score da tabela public.deal_health_scores. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (health_score >= 0 AND health_score <= 100). |
| 4 | `health_label` | `text` | não |  |  | Coluna health_label da tabela public.deal_health_scores. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (health_label = ANY (ARRAY['critical'::text, 'at_risk'::text, 'healthy'::text, 'excellent'::text])). |
| 5 | `positive_factors` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna positive_factors da tabela public.deal_health_scores. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 6 | `negative_factors` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna negative_factors da tabela public.deal_health_scores. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 7 | `ai_recommendation` | `text` | sim |  |  | Coluna ai_recommendation da tabela public.deal_health_scores. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.deal_health_scores. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.deal_health_scores. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.deal_health_scores. Tipo PostgreSQL: uuid. Aceita NULL. |
| 11 | `tier` | `text` | não | `'watch'::text` |  | Coluna tier da tabela public.deal_health_scores. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'watch'::text. Validação CHECK: CHECK (tier = ANY (ARRAY['healthy'::text, 'watch'::text, 'at_risk'::text, 'critical'::text])). |
| 12 | `factors` | `jsonb` | não | `'[]'::jsonb` |  | Coluna factors da tabela public.deal_health_scores. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 13 | `recommended_actions` | `jsonb` | não | `'[]'::jsonb` |  | Coluna recommended_actions da tabela public.deal_health_scores. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 14 | `last_activity_at` | `timestamp with time zone` | sim |  |  | Coluna last_activity_at da tabela public.deal_health_scores. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 15 | `days_in_stage` | `integer` | sim | `0` |  | Coluna days_in_stage da tabela public.deal_health_scores. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.deal_health_scores. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_health_scores_health_label_check | CHECK | `CHECK (health_label = ANY (ARRAY['critical'::text, 'at_risk'::text, 'healthy'::text, 'excellent'::text]))` |  |  | sim |
| deal_health_scores_health_score_check | CHECK | `CHECK (health_score >= 0 AND health_score <= 100)` |  |  | sim |
| deal_health_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_health_scores_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_health_scores_tier_check | CHECK | `CHECK (tier = ANY (ARRAY['healthy'::text, 'watch'::text, 'at_risk'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_health_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_health_scores_pkey ON public.deal_health_scores USING btree (id)` |
| idx_deal_health_sale | btree | sale_id, computed_at | não | sim |  | `CREATE INDEX idx_deal_health_sale ON public.deal_health_scores USING btree (sale_id, computed_at DESC)` |
| idx_deal_health_scores_owner_tier | btree | owner_id, tier, health_score | não | sim |  | `CREATE INDEX idx_deal_health_scores_owner_tier ON public.deal_health_scores USING btree (owner_id, tier, health_score)` |
| idx_deal_health_scores_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_deal_health_scores_sale ON public.deal_health_scores USING btree (sale_id)` |


## Policies (RLS)

### `Insert health scores for accessible sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(( SELECT is_admin_or_manager(( SELECT auth.uid() AS uid)) AS is_admin_or_manager) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_health_scores.sale_id) AND (s.salesperson_id = ( SELECT get_current_salesperson_id() AS get_current_salesperson_id))))))` |

### `System can manage deal health`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Users see own deal health`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `View health via sale access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_health_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_deal_health_scores_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |
| trg_track_deal_health_change | AFTER | INSERT OR UPDATE | ROW | enabled | private.track_deal_health_change |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
