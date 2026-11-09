# public.deal_velocity_alerts

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
| 3 | `current_stage` | `text` | não |  |  |  |
| 4 | `hours_in_stage` | `numeric` | não | `0` |  |  |
| 5 | `baseline_p75` | `numeric` | não | `0` |  |  |
| 6 | `baseline_p90` | `numeric` | não | `0` |  |  |
| 7 | `severity` | `text` | não | `'watch'::text` |  |  |
| 8 | `recommendation` | `text` | sim |  |  |  |
| 9 | `detected_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_velocity_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_velocity_alerts_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_velocity_alerts_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |
| severity_chk | CHECK | `CHECK (severity = ANY (ARRAY['watch'::text, 'stuck'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_velocity_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_velocity_alerts_pkey ON public.deal_velocity_alerts USING btree (id)` |
| deal_velocity_alerts_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX deal_velocity_alerts_sale_id_key ON public.deal_velocity_alerts USING btree (sale_id)` |
| idx_dva_severity | btree | severity, detected_at | não | sim |  | `CREATE INDEX idx_dva_severity ON public.deal_velocity_alerts USING btree (severity, detected_at DESC)` |
| idx_dva_stage | btree | current_stage | não | sim |  | `CREATE INDEX idx_dva_stage ON public.deal_velocity_alerts USING btree (current_stage)` |


## Policies (RLS)

### `admin manager write velocity alerts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `auth read velocity alerts`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
