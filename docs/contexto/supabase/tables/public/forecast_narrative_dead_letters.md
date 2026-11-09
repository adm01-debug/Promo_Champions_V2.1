# public.forecast_narrative_dead_letters

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
| 2 | `forecast_id` | `uuid` | sim |  |  |  |
| 3 | `user_id` | `uuid` | sim |  |  |  |
| 4 | `reason` | `text` | não |  |  |  |
| 5 | `http_status` | `integer` | sim |  |  |  |
| 6 | `error_detail` | `text` | sim |  |  |  |
| 7 | `request_id` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_narrative_dead_letters_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_narrative_dead_letters_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_narrative_dead_letters_pkey ON public.forecast_narrative_dead_letters USING btree (id)` |
| idx_fnd_dlq_created | btree | created_at | não | sim |  | `CREATE INDEX idx_fnd_dlq_created ON public.forecast_narrative_dead_letters USING btree (created_at DESC)` |
| idx_fnd_dlq_reason | btree | reason, created_at | não | sim |  | `CREATE INDEX idx_fnd_dlq_reason ON public.forecast_narrative_dead_letters USING btree (reason, created_at DESC)` |


## Policies (RLS)

### `admins read forecast narrative dlq`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
