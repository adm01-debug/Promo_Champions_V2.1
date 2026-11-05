# public.deal_stage_history

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
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `stage` | `text` | não |  |  |  |
| 4 | `entered_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `exited_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `is_backfilled` | `boolean` | não | `false` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_stage_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_stage_history_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_stage_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_stage_history_pkey ON public.deal_stage_history USING btree (id)` |
| idx_deal_stage_history_entered_at | btree | entered_at | não | sim | `(stage = ANY (ARRAY['completed'::text, 'Fechado'::text]))` | `CREATE INDEX idx_deal_stage_history_entered_at ON public.deal_stage_history USING btree (entered_at) WHERE (stage = ANY (ARRAY['completed'::text, 'Fechado'::text]))` |
| idx_deal_stage_history_sale | btree | sale_id, entered_at | não | sim |  | `CREATE INDEX idx_deal_stage_history_sale ON public.deal_stage_history USING btree (sale_id, entered_at DESC)` |
| idx_deal_stage_history_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_deal_stage_history_sale_id ON public.deal_stage_history USING btree (sale_id)` |


## Policies (RLS)

### `Users can insert own deal_stage_history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own deal_stage_history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own deal_stage_history`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
