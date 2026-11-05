# public.email_engagement_score_history

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `score` | `integer` | não |  |  |  |
| 4 | `tier` | `text` | não |  |  |  |
| 5 | `captured_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_engagement_score_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| email_engagement_score_history_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_engagement_score_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_engagement_score_history_pkey ON public.email_engagement_score_history USING btree (id)` |
| idx_eesh_sale_date | btree | sale_id, captured_at | não | sim |  | `CREATE INDEX idx_eesh_sale_date ON public.email_engagement_score_history USING btree (sale_id, captured_at DESC)` |


## Policies (RLS)

### `Owners view own engagement history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = email_engagement_score_history.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
