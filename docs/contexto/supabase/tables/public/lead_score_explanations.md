# public.lead_score_explanations

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `score` | `integer` | não |  |  |  |
| 4 | `baseline_score` | `numeric` | não | `0` |  |  |
| 5 | `top_drivers` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 6 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `narrative` | `text` | sim |  |  |  |
| 8 | `model_version` | `text` | não | `'v1'::text` |  |  |
| 9 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_score_explanations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_score_explanations_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_score_explanations_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_score_explanations_calculated | btree | calculated_at | não | sim |  | `CREATE INDEX idx_lead_score_explanations_calculated ON public.lead_score_explanations USING btree (calculated_at DESC)` |
| idx_lead_score_explanations_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_lead_score_explanations_sale ON public.lead_score_explanations USING btree (sale_id)` |
| lead_score_explanations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_score_explanations_pkey ON public.lead_score_explanations USING btree (id)` |
| lead_score_explanations_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX lead_score_explanations_sale_id_key ON public.lead_score_explanations USING btree (sale_id)` |


## Policies (RLS)

### `Admins manage explanations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Salespeople view own deal explanations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_score_explanations.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Service role manages explanations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'service_role'::text)` |
| WITH CHECK | `(auth.role() = 'service_role'::text)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_lead_score_explanations_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
