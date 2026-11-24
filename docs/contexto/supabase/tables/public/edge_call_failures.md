# public.edge_call_failures

> Tabela public.edge_call_failures. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), function_name text NOT NULL, target_function text NULLABLE, context jsonb NOT NULL DEFAULT '{}'::jsonb, error_message text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.edge_call_failures. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `function_name` | `text` | não |  |  | Coluna function_name da tabela public.edge_call_failures. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `target_function` | `text` | sim |  |  | Coluna target_function da tabela public.edge_call_failures. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `context` | `jsonb` | não | `'{}'::jsonb` |  | Coluna context da tabela public.edge_call_failures. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 5 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.edge_call_failures. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.edge_call_failures. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| edge_call_failures_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| edge_call_failures_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX edge_call_failures_pkey ON public.edge_call_failures USING btree (id)` |
| idx_edge_call_failures_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_edge_call_failures_created_at ON public.edge_call_failures USING btree (created_at DESC)` |


## Policies (RLS)

### `Admins can view edge call failures`

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
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
