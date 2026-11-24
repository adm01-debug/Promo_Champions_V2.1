# public.win_calibration_buckets

> Tabela public.win_calibration_buckets. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), stage text NOT NULL, segment text NOT NULL DEFAULT 'all'::text, bucket_min numeric NOT NULL, bucket_max numeric NOT NULL, actual_win_rate numeric NOT NULL DEFAULT 0, sample_size integer NOT NULL DEFAULT 0, computed_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_calibration_buckets. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `stage` | `text` | não |  |  | Coluna stage da tabela public.win_calibration_buckets. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `segment` | `text` | não | `'all'::text` |  | Coluna segment da tabela public.win_calibration_buckets. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'all'::text. |
| 4 | `bucket_min` | `numeric` | não |  |  | Coluna bucket_min da tabela public.win_calibration_buckets. Tipo PostgreSQL: numeric. Não aceita NULL. |
| 5 | `bucket_max` | `numeric` | não |  |  | Coluna bucket_max da tabela public.win_calibration_buckets. Tipo PostgreSQL: numeric. Não aceita NULL. |
| 6 | `actual_win_rate` | `numeric` | não | `0` |  | Coluna actual_win_rate da tabela public.win_calibration_buckets. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `sample_size` | `integer` | não | `0` |  | Coluna sample_size da tabela public.win_calibration_buckets. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.win_calibration_buckets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
