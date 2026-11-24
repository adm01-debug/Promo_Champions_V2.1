# public.league_members

> Tabela public.league_members. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, league_id uuid NOT NULL, weekly_xp integer NOT NULL DEFAULT 0, joined_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), last_reset_xp integer NULLABLE DEFAULT 0, current_streak integer NULLABLE DEFAULT 0, max_streak integer NULLABLE DEFAULT 0, promoted_at timestamp with time zone NULLABLE, demoted_at timestamp with time zone NULLABLE. Relacionamentos FK: league_id → public.leagues(id); salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.league_members. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.league_members. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `league_id` | `uuid` | não |  |  | Coluna league_id da tabela public.league_members. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.leagues(id). |
| 4 | `weekly_xp` | `integer` | não | `0` |  | Coluna weekly_xp da tabela public.league_members. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `joined_at` | `timestamp with time zone` | não | `now()` |  | Coluna joined_at da tabela public.league_members. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.league_members. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `last_reset_xp` | `integer` | sim | `0` |  | Coluna last_reset_xp da tabela public.league_members. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 8 | `current_streak` | `integer` | sim | `0` |  | Coluna current_streak da tabela public.league_members. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 9 | `max_streak` | `integer` | sim | `0` |  | Coluna max_streak da tabela public.league_members. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 10 | `promoted_at` | `timestamp with time zone` | sim |  |  | Coluna promoted_at da tabela public.league_members. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `demoted_at` | `timestamp with time zone` | sim |  |  | Coluna demoted_at da tabela public.league_members. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| league_members_league_id_fkey | FOREIGN KEY | `FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| league_members_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| league_members_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| league_members_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_league_members_league_id | btree | league_id | não | sim |  | `CREATE INDEX idx_league_members_league_id ON public.league_members USING btree (league_id)` |
| league_members_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX league_members_pkey ON public.league_members USING btree (id)` |
| league_members_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX league_members_salesperson_id_key ON public.league_members USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update league_members`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Anyone can read league_members`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can insert own league_members`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
