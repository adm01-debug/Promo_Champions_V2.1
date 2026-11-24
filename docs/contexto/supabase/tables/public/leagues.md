# public.leagues

> Tabela public.leagues. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, tier integer NOT NULL DEFAULT 1, icon text NOT NULL DEFAULT '🥉'::text, color text NOT NULL DEFAULT '#94a3b8'::text, min_xp integer NOT NULL DEFAULT 0, xp_bonus_percent integer NOT NULL DEFAULT 0, promotion_slots integer NOT NULL DEFAULT 3, demotion_slots integer NOT NULL DEFAULT 3, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.leagues. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.leagues. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `tier` | `integer` | não | `1` |  | Coluna tier da tabela public.leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 4 | `icon` | `text` | não | `'🥉'::text` |  | Coluna icon da tabela public.leagues. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: '🥉'::text. |
| 5 | `color` | `text` | não | `'#94a3b8'::text` |  | Coluna color da tabela public.leagues. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: '#94a3b8'::text. |
| 6 | `min_xp` | `integer` | não | `0` |  | Coluna min_xp da tabela public.leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `xp_bonus_percent` | `integer` | não | `0` |  | Coluna xp_bonus_percent da tabela public.leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `promotion_slots` | `integer` | não | `3` |  | Coluna promotion_slots da tabela public.leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 3. |
| 9 | `demotion_slots` | `integer` | não | `3` |  | Coluna demotion_slots da tabela public.leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 3. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.leagues. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| leagues_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.league_history | league_history_league_id_fkey | league_id | CASCADE |
| public.league_members | league_members_league_id_fkey | league_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| leagues_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX leagues_pkey ON public.leagues USING btree (id)` |


## Policies (RLS)

### `Anyone can read leagues`

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
