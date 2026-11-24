# public.deal_stakeholders

> Tabela public.deal_stakeholders. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, owner_id uuid NOT NULL, name text NOT NULL, role_title text NULLABLE, dmu_role text NOT NULL DEFAULT 'unknown'::text, influence_level text NOT NULL DEFAULT 'medium'::text, engagement_score integer NOT NULL DEFAULT 0, sentiment text NOT NULL DEFAULT 'neutral'::text, email text NULLABLE, phone text NULLABLE, linkedin_url text NULLABLE, notes text NULLABLE, signals jsonb NOT NULL DEFAULT '[]'::jsonb, last_interaction_at timestamp with time zone NULLABLE, source text NOT NULL DEFAULT 'manual'::text, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), evidence_quote text NULLABLE, confidence numeric NULLABLE. Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_stakeholders. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_stakeholders. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.deal_stakeholders. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `name` | `text` | não |  |  | Coluna name da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `role_title` | `text` | sim |  |  | Coluna role_title da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `dmu_role` | `text` | não | `'unknown'::text` |  | Coluna dmu_role da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'unknown'::text. Validação CHECK: CHECK (dmu_role = ANY (ARRAY['decision_maker'::text, 'economic_buyer'::text, 'champion'::text, 'influencer'::text, 'user'::text, 'blocker'::text, 'unknown'::text])). |
| 7 | `influence_level` | `text` | não | `'medium'::text` |  | Coluna influence_level da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'medium'::text. Validação CHECK: CHECK (influence_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])). |
| 8 | `engagement_score` | `integer` | não | `0` |  | Coluna engagement_score da tabela public.deal_stakeholders. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (engagement_score >= 0 AND engagement_score <= 100). |
| 9 | `sentiment` | `text` | não | `'neutral'::text` |  | Coluna sentiment da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'neutral'::text. Validação CHECK: CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text])). |
| 10 | `email` | `text` | sim |  |  | Coluna email da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `phone` | `text` | sim |  |  | Coluna phone da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `linkedin_url` | `text` | sim |  |  | Coluna linkedin_url da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `signals` | `jsonb` | não | `'[]'::jsonb` |  | Coluna signals da tabela public.deal_stakeholders. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 15 | `last_interaction_at` | `timestamp with time zone` | sim |  |  | Coluna last_interaction_at da tabela public.deal_stakeholders. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 16 | `source` | `text` | não | `'manual'::text` |  | Coluna source da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'manual'::text. Validação CHECK: CHECK (source = ANY (ARRAY['manual'::text, 'ai_extracted'::text, 'email'::text, 'call'::text])). |
| 17 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.deal_stakeholders. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 18 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.deal_stakeholders. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 19 | `evidence_quote` | `text` | sim |  |  | Coluna evidence_quote da tabela public.deal_stakeholders. Tipo PostgreSQL: text. Aceita NULL. |
| 20 | `confidence` | `numeric` | sim |  |  | Coluna confidence da tabela public.deal_stakeholders. Tipo PostgreSQL: numeric. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
