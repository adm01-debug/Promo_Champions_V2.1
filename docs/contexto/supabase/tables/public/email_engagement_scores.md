# public.email_engagement_scores

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `score` | `integer` | não | `0` |  |  |
| 4 | `tier` | `text` | não | `'cold'::text` |  |  |
| 5 | `open_rate` | `numeric(5,2)` | não | `0` |  |  |
| 6 | `click_rate` | `numeric(5,2)` | não | `0` |  |  |
| 7 | `reply_rate` | `numeric(5,2)` | não | `0` |  |  |
| 8 | `avg_response_minutes` | `integer` | sim |  |  |  |
| 9 | `recency_days` | `integer` | sim |  |  |  |
| 10 | `total_sent` | `integer` | não | `0` |  |  |
| 11 | `total_opens` | `integer` | não | `0` |  |  |
| 12 | `total_clicks` | `integer` | não | `0` |  |  |
| 13 | `total_replies` | `integer` | não | `0` |  |  |
| 14 | `last_calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_engagement_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| email_engagement_scores_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| email_engagement_scores_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |
| email_engagement_scores_score_check | CHECK | `CHECK (score >= 0 AND score <= 100)` |  |  | sim |
| email_engagement_scores_tier_check | CHECK | `CHECK (tier = ANY (ARRAY['cold'::text, 'warm'::text, 'hot'::text, 'champion'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_engagement_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_engagement_scores_pkey ON public.email_engagement_scores USING btree (id)` |
| email_engagement_scores_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX email_engagement_scores_sale_id_key ON public.email_engagement_scores USING btree (sale_id)` |
| idx_ees_score | btree | score | não | sim |  | `CREATE INDEX idx_ees_score ON public.email_engagement_scores USING btree (score DESC)` |
| idx_ees_tier | btree | tier | não | sim |  | `CREATE INDEX idx_ees_tier ON public.email_engagement_scores USING btree (tier)` |


## Policies (RLS)

### `Admins manage engagement scores`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Owners view own engagement scores`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = email_engagement_scores.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_snapshot_engagement_score | AFTER | INSERT OR UPDATE | ROW | enabled | public.snapshot_engagement_score |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
