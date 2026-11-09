# public.win_calibration_buckets

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
| 2 | `stage` | `text` | não |  |  |  |
| 3 | `segment` | `text` | não | `'all'::text` |  |  |
| 4 | `bucket_min` | `numeric` | não |  |  |  |
| 5 | `bucket_max` | `numeric` | não |  |  |  |
| 6 | `actual_win_rate` | `numeric` | não | `0` |  |  |
| 7 | `sample_size` | `integer` | não | `0` |  |  |
| 8 | `computed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_calibration_buckets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| win_calibration_buckets_stage_segment_bucket_min_key | UNIQUE | `UNIQUE (stage, segment, bucket_min)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_win_calibration_buckets_stage_segment | btree | stage, segment | não | sim |  | `CREATE INDEX idx_win_calibration_buckets_stage_segment ON public.win_calibration_buckets USING btree (stage, segment)` |
| win_calibration_buckets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_calibration_buckets_pkey ON public.win_calibration_buckets USING btree (id)` |
| win_calibration_buckets_stage_segment_bucket_min_key | btree | stage, segment, bucket_min | sim | sim |  | `CREATE UNIQUE INDEX win_calibration_buckets_stage_segment_bucket_min_key ON public.win_calibration_buckets USING btree (stage, segment, bucket_min)` |


## Policies (RLS)

### `Admin/manager manage win_calibration_buckets`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read win_calibration_buckets`

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
