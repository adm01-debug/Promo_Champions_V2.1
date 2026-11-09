# public.committee_extraction_runs

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
| 2 | `recording_id` | `uuid` | sim |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `extracted_count` | `integer` | não | `0` |  |  |
| 5 | `created_count` | `integer` | não | `0` |  |  |
| 6 | `updated_count` | `integer` | não | `0` |  |  |
| 7 | `confidence` | `numeric` | não | `0` |  |  |
| 8 | `raw_output` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| committee_extraction_runs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| committee_extraction_runs_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| committee_extraction_runs_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| committee_extraction_runs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX committee_extraction_runs_pkey ON public.committee_extraction_runs USING btree (id)` |
| idx_cer_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_cer_recording ON public.committee_extraction_runs USING btree (recording_id)` |
| idx_cer_sale | btree | sale_id, created_at | não | sim |  | `CREATE INDEX idx_cer_sale ON public.committee_extraction_runs USING btree (sale_id, created_at DESC)` |


## Policies (RLS)

### `admin manager write extraction runs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `auth read extraction runs`

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
