# public.competitive_seasons

> Tabela public.competitive_seasons. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, season_number integer NOT NULL DEFAULT 1, starts_at timestamp with time zone NOT NULL, ends_at timestamp with time zone NOT NULL, status text NOT NULL DEFAULT 'active'::text, xp_multiplier numeric NOT NULL DEFAULT 1.0, metadata jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.competitive_seasons. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.competitive_seasons. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `season_number` | `integer` | não | `1` |  | Coluna season_number da tabela public.competitive_seasons. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 4 | `starts_at` | `timestamp with time zone` | não |  |  | Coluna starts_at da tabela public.competitive_seasons. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 5 | `ends_at` | `timestamp with time zone` | não |  |  | Coluna ends_at da tabela public.competitive_seasons. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 6 | `status` | `text` | não | `'active'::text` |  | Coluna status da tabela public.competitive_seasons. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'active'::text. |
| 7 | `xp_multiplier` | `numeric` | não | `1.0` |  | Coluna xp_multiplier da tabela public.competitive_seasons. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 1.0. |
| 8 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.competitive_seasons. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.competitive_seasons. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| competitive_seasons_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| competitive_seasons_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX competitive_seasons_pkey ON public.competitive_seasons USING btree (id)` |


## Policies (RLS)

### `Admins can manage seasons`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can read seasons`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
