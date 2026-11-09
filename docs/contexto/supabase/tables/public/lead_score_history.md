# public.lead_score_history

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
| 3 | `score` | `integer` | não |  |  |  |
| 4 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `recorded_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_score_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_score_history_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_score_history_sale_time | btree | sale_id, recorded_at | não | sim |  | `CREATE INDEX idx_lead_score_history_sale_time ON public.lead_score_history USING btree (sale_id, recorded_at DESC)` |
| lead_score_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_score_history_pkey ON public.lead_score_history USING btree (id)` |


## Policies (RLS)

### `Salespeople view own deal history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_score_history.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Service role inserts history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.role() = 'service_role'::text)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
