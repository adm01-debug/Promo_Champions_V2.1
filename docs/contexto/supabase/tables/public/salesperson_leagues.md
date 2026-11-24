# public.salesperson_leagues

> Tabela public.salesperson_leagues. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, league sales_league NOT NULL DEFAULT 'bronze'::sales_league, season_number integer NOT NULL DEFAULT 1, promoted_at timestamp with time zone NULLABLE, demoted_at timestamp with time zone NULLABLE, points integer NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.salesperson_leagues. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.salesperson_leagues. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `league` | `sales_league` | não | `'bronze'::sales_league` |  | Coluna league da tabela public.salesperson_leagues. Tipo PostgreSQL: sales_league. Não aceita NULL. Valor padrão: 'bronze'::sales_league. Valores do enum: 'bronze', 'silver', 'gold', 'diamond'. |
| 4 | `season_number` | `integer` | não | `1` |  | Coluna season_number da tabela public.salesperson_leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 5 | `promoted_at` | `timestamp with time zone` | sim |  |  | Coluna promoted_at da tabela public.salesperson_leagues. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 6 | `demoted_at` | `timestamp with time zone` | sim |  |  | Coluna demoted_at da tabela public.salesperson_leagues. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 7 | `points` | `integer` | não | `0` |  | Coluna points da tabela public.salesperson_leagues. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.salesperson_leagues. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.salesperson_leagues. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_leagues_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_leagues_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_leagues_salesperson_id_season_number_key | UNIQUE | `UNIQUE (salesperson_id, season_number)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_salesperson_leagues_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_salesperson_leagues_salesperson_id ON public.salesperson_leagues USING btree (salesperson_id)` |
| salesperson_leagues_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_leagues_pkey ON public.salesperson_leagues USING btree (id)` |
| salesperson_leagues_salesperson_id_season_number_key | btree | salesperson_id, season_number | sim | sim |  | `CREATE UNIQUE INDEX salesperson_leagues_salesperson_id_season_number_key ON public.salesperson_leagues USING btree (salesperson_id, season_number)` |


## Policies (RLS)

### `Anyone can read leagues`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `System can manage leagues`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


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
