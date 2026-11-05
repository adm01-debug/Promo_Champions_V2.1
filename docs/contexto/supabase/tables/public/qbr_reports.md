# public.qbr_reports

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
| 2 | `period_label` | `text` | não |  |  |  |
| 3 | `period_start` | `date` | não |  |  |  |
| 4 | `period_end` | `date` | não |  |  |  |
| 5 | `salesperson_id` | `uuid` | sim |  |  |  |
| 6 | `metrics` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 7 | `ai_narrative` | `text` | sim |  |  |  |
| 8 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 9 | `generated_by` | `uuid` | sim |  |  |  |
| 10 | `generated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| qbr_reports_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| qbr_reports_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qbr_period | btree | period_start | não | sim |  | `CREATE INDEX idx_qbr_period ON public.qbr_reports USING btree (period_start DESC)` |
| idx_qbr_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_qbr_sp ON public.qbr_reports USING btree (salesperson_id)` |
| qbr_reports_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX qbr_reports_pkey ON public.qbr_reports USING btree (id)` |


## Policies (RLS)

### `qbr_delete_admin`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `qbr_insert_admin`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `qbr_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
