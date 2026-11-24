# public.forecast_narrative_dead_letters

> Tabela public.forecast_narrative_dead_letters. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), forecast_id uuid NULLABLE, user_id uuid NULLABLE, reason text NOT NULL, http_status integer NULLABLE, error_detail text NULLABLE, request_id text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `forecast_id` | `uuid` | sim |  |  | Coluna forecast_id da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: uuid. Aceita NULL. |
| 3 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `reason` | `text` | não |  |  | Coluna reason da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `http_status` | `integer` | sim |  |  | Coluna http_status da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `error_detail` | `text` | sim |  |  | Coluna error_detail da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.forecast_narrative_dead_letters. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
