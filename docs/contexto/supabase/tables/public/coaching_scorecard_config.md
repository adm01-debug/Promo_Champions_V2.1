# public.coaching_scorecard_config

> Tabela public.coaching_scorecard_config. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), dimension_name text NOT NULL, weight integer NULLABLE DEFAULT 1, description text NULLABLE, is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.coaching_scorecard_config. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `dimension_name` | `text` | não |  |  | Coluna dimension_name da tabela public.coaching_scorecard_config. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `weight` | `integer` | sim | `1` |  | Coluna weight da tabela public.coaching_scorecard_config. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 1. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.coaching_scorecard_config. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.coaching_scorecard_config. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.coaching_scorecard_config. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| coaching_scorecard_config_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| coaching_scorecard_config_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX coaching_scorecard_config_pkey ON public.coaching_scorecard_config USING btree (id)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
