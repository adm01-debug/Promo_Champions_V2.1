# public.contact_engagement_score

> Tabela public.contact_engagement_score. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), contact_id uuid NOT NULL, contact_type text NOT NULL, score numeric(5,2) NOT NULL DEFAULT 0, tier text NOT NULL DEFAULT 'cold'::text, total_opens integer NOT NULL DEFAULT 0, total_clicks integer NOT NULL DEFAULT 0, total_replies integer NOT NULL DEFAULT 0, last_signal_at timestamp with time zone NULLABLE, decay_applied_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.engagement_score_leaderboard |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.contact_engagement_score. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `contact_id` | `uuid` | não |  |  | Coluna contact_id da tabela public.contact_engagement_score. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `contact_type` | `text` | não |  |  | Coluna contact_type da tabela public.contact_engagement_score. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text])). |
| 4 | `score` | `numeric(5,2)` | não | `0` |  | Coluna score da tabela public.contact_engagement_score. Tipo PostgreSQL: numeric(5,2). Não aceita NULL. Valor padrão: 0. |
| 5 | `tier` | `text` | não | `'cold'::text` |  | Coluna tier da tabela public.contact_engagement_score. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'cold'::text. Validação CHECK: CHECK (tier = ANY (ARRAY['cold'::text, 'warm'::text, 'hot'::text, 'on_fire'::text])). |
| 6 | `total_opens` | `integer` | não | `0` |  | Coluna total_opens da tabela public.contact_engagement_score. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `total_clicks` | `integer` | não | `0` |  | Coluna total_clicks da tabela public.contact_engagement_score. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `total_replies` | `integer` | não | `0` |  | Coluna total_replies da tabela public.contact_engagement_score. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `last_signal_at` | `timestamp with time zone` | sim |  |  | Coluna last_signal_at da tabela public.contact_engagement_score. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `decay_applied_at` | `timestamp with time zone` | não | `now()` |  | Coluna decay_applied_at da tabela public.contact_engagement_score. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.contact_engagement_score. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| contact_engagement_score_contact_id_contact_type_key | UNIQUE | `UNIQUE (contact_id, contact_type)` |  |  | sim |
| contact_engagement_score_contact_type_check | CHECK | `CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text]))` |  |  | sim |
| contact_engagement_score_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| contact_engagement_score_tier_check | CHECK | `CHECK (tier = ANY (ARRAY['cold'::text, 'warm'::text, 'hot'::text, 'on_fire'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| contact_engagement_score_contact_id_contact_type_key | btree | contact_id, contact_type | sim | sim |  | `CREATE UNIQUE INDEX contact_engagement_score_contact_id_contact_type_key ON public.contact_engagement_score USING btree (contact_id, contact_type)` |
| contact_engagement_score_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX contact_engagement_score_pkey ON public.contact_engagement_score USING btree (id)` |
| idx_ces_contact | btree | contact_id, contact_type | não | sim |  | `CREATE INDEX idx_ces_contact ON public.contact_engagement_score USING btree (contact_id, contact_type)` |
| idx_ces_score_tier | btree | tier, score | não | sim |  | `CREATE INDEX idx_ces_score_tier ON public.contact_engagement_score USING btree (tier, score DESC)` |


## Policies (RLS)

### `ces_admin_all`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `ces_select_owner`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `user_owns_engagement_contact(contact_id, contact_type)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
