# public.engagement_score_history

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
| 2 | `contact_id` | `uuid` | não |  |  |  |
| 3 | `contact_type` | `text` | não |  |  |  |
| 4 | `score` | `numeric(5,2)` | não |  |  |  |
| 5 | `tier` | `text` | não |  |  |  |
| 6 | `captured_at` | `date` | não | `CURRENT_DATE` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| engagement_score_history_contact_id_contact_type_captured_a_key | UNIQUE | `UNIQUE (contact_id, contact_type, captured_at)` |  |  | sim |
| engagement_score_history_contact_type_check | CHECK | `CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text]))` |  |  | sim |
| engagement_score_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| engagement_score_history_contact_id_contact_type_captured_a_key | btree | contact_id, contact_type, captured_at | sim | sim |  | `CREATE UNIQUE INDEX engagement_score_history_contact_id_contact_type_captured_a_key ON public.engagement_score_history USING btree (contact_id, contact_type, captured_at)` |
| engagement_score_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX engagement_score_history_pkey ON public.engagement_score_history USING btree (id)` |
| idx_esh_contact_date | btree | contact_id, contact_type, captured_at | não | sim |  | `CREATE INDEX idx_esh_contact_date ON public.engagement_score_history USING btree (contact_id, contact_type, captured_at DESC)` |


## Policies (RLS)

### `esh_admin_all`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `esh_select_owner`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `user_owns_engagement_contact(contact_id, contact_type)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
