# public.deal_stakeholders

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | não |  |  |  |
| 4 | `name` | `text` | não |  |  |  |
| 5 | `role_title` | `text` | sim |  |  |  |
| 6 | `dmu_role` | `text` | não | `'unknown'::text` |  |  |
| 7 | `influence_level` | `text` | não | `'medium'::text` |  |  |
| 8 | `engagement_score` | `integer` | não | `0` |  |  |
| 9 | `sentiment` | `text` | não | `'neutral'::text` |  |  |
| 10 | `email` | `text` | sim |  |  |  |
| 11 | `phone` | `text` | sim |  |  |  |
| 12 | `linkedin_url` | `text` | sim |  |  |  |
| 13 | `notes` | `text` | sim |  |  |  |
| 14 | `signals` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 15 | `last_interaction_at` | `timestamp with time zone` | sim |  |  |  |
| 16 | `source` | `text` | não | `'manual'::text` |  |  |
| 17 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 18 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 19 | `evidence_quote` | `text` | sim |  |  |  |
| 20 | `confidence` | `numeric` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_stakeholders_dmu_role_check | CHECK | `CHECK (dmu_role = ANY (ARRAY['decision_maker'::text, 'economic_buyer'::text, 'champion'::text, 'influencer'::text, 'user'::text, 'blocker'::text, 'unknown'::text]))` |  |  | sim |
| deal_stakeholders_engagement_score_check | CHECK | `CHECK (engagement_score >= 0 AND engagement_score <= 100)` |  |  | sim |
| deal_stakeholders_influence_level_check | CHECK | `CHECK (influence_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))` |  |  | sim |
| deal_stakeholders_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_stakeholders_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_stakeholders_sentiment_check | CHECK | `CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text]))` |  |  | sim |
| deal_stakeholders_source_check | CHECK | `CHECK (source = ANY (ARRAY['manual'::text, 'ai_extracted'::text, 'email'::text, 'call'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_stakeholders_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_stakeholders_pkey ON public.deal_stakeholders USING btree (id)` |
| idx_deal_stakeholders_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_deal_stakeholders_owner ON public.deal_stakeholders USING btree (owner_id)` |
| idx_deal_stakeholders_sale_role | btree | sale_id, dmu_role | não | sim |  | `CREATE INDEX idx_deal_stakeholders_sale_role ON public.deal_stakeholders USING btree (sale_id, dmu_role)` |
| idx_deal_stakeholders_unique_name | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX idx_deal_stakeholders_unique_name ON public.deal_stakeholders USING btree (sale_id, lower(name))` |


## Policies (RLS)

### `Owners delete own stakeholders`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners insert own stakeholders`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Owners update own stakeholders`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners view own stakeholders`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_deal_stakeholders_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
