# public.cohort_analyses

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
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `cohort_field` | `text` | não | `'created_at'::text` |  |  |
| 6 | `metric_field` | `text` | não | `'amount'::text` |  |  |
| 7 | `period_type` | `text` | não | `'month'::text` |  |  |
| 8 | `config` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cohort_analyses_period_type_check | CHECK | `CHECK (period_type = ANY (ARRAY['week'::text, 'month'::text, 'quarter'::text]))` |  |  | sim |
| cohort_analyses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cohort_analyses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cohort_analyses_pkey ON public.cohort_analyses USING btree (id)` |
| idx_cohort_analyses_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_cohort_analyses_owner ON public.cohort_analyses USING btree (owner_id)` |


## Policies (RLS)

### `owner_full_access_cohorts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_cohort_analyses_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
