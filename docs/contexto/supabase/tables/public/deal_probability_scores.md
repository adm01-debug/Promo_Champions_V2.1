# public.deal_probability_scores

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `raw_probability` | `numeric` | não | `0` |  |  |
| 4 | `calibrated_probability` | `numeric` | não | `0` |  |  |
| 5 | `confidence` | `numeric` | não | `0` |  |  |
| 6 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 7 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_probability_scores_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| deal_probability_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_probability_scores_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_probability_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_probability_scores_pkey ON public.deal_probability_scores USING btree (id)` |
| idx_dps_calculated_at | btree | calculated_at | não | sim |  | `CREATE INDEX idx_dps_calculated_at ON public.deal_probability_scores USING btree (calculated_at DESC)` |
| idx_dps_sale_calculated | btree | sale_id, calculated_at | não | sim |  | `CREATE INDEX idx_dps_sale_calculated ON public.deal_probability_scores USING btree (sale_id, calculated_at DESC)` |


## Policies (RLS)

### `Admin/manager write deal scores`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read deal scores`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
