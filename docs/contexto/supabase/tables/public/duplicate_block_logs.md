# public.duplicate_block_logs

> Tabela public.duplicate_block_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), created_at timestamp with time zone NOT NULL DEFAULT now(), entity_name text NOT NULL, block_type text NOT NULL, status text NOT NULL DEFAULT 'Blocked'::text, auditor text NOT NULL DEFAULT 'System IA'::text, confidence_score double precision NOT NULL DEFAULT 1.0, details jsonb NULLABLE DEFAULT '{}'::jsonb.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.duplicate_block_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.duplicate_block_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 3 | `entity_name` | `text` | não |  |  | Coluna entity_name da tabela public.duplicate_block_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `block_type` | `text` | não |  |  | Coluna block_type da tabela public.duplicate_block_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `status` | `text` | não | `'Blocked'::text` |  | Coluna status da tabela public.duplicate_block_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'Blocked'::text. |
| 6 | `auditor` | `text` | não | `'System IA'::text` |  | Coluna auditor da tabela public.duplicate_block_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'System IA'::text. |
| 7 | `confidence_score` | `double precision` | não | `1.0` |  | Coluna confidence_score da tabela public.duplicate_block_logs. Tipo PostgreSQL: double precision. Não aceita NULL. Valor padrão: 1.0. |
| 8 | `details` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna details da tabela public.duplicate_block_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| duplicate_block_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| duplicate_block_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX duplicate_block_logs_pkey ON public.duplicate_block_logs USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view duplicate block logs`

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
