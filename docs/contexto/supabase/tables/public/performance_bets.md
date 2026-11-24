# public.performance_bets

> Tabela public.performance_bets. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, bet_type text NOT NULL, target_value numeric NOT NULL, xp_wagered integer NOT NULL DEFAULT 100, xp_multiplier numeric NOT NULL DEFAULT 2.0, current_value numeric NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'active'::text, description text NULLABLE, starts_at timestamp with time zone NOT NULL DEFAULT now(), ends_at timestamp with time zone NOT NULL, resolved_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.performance_bets. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.performance_bets. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `bet_type` | `text` | não |  |  | Coluna bet_type da tabela public.performance_bets. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (bet_type = ANY (ARRAY['deals'::text, 'revenue'::text, 'calls'::text, 'meetings'::text, 'activities'::text])). |
| 4 | `target_value` | `numeric` | não |  |  | Coluna target_value da tabela public.performance_bets. Tipo PostgreSQL: numeric. Não aceita NULL. |
| 5 | `xp_wagered` | `integer` | não | `100` |  | Coluna xp_wagered da tabela public.performance_bets. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 100. |
| 6 | `xp_multiplier` | `numeric` | não | `2.0` |  | Coluna xp_multiplier da tabela public.performance_bets. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 2.0. |
| 7 | `current_value` | `numeric` | não | `0` |  | Coluna current_value da tabela public.performance_bets. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `status` | `text` | não | `'active'::text` |  | Coluna status da tabela public.performance_bets. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'active'::text. Validação CHECK: CHECK (status = ANY (ARRAY['active'::text, 'won'::text, 'lost'::text, 'cancelled'::text])). |
| 9 | `description` | `text` | sim |  |  | Coluna description da tabela public.performance_bets. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `starts_at` | `timestamp with time zone` | não | `now()` |  | Coluna starts_at da tabela public.performance_bets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `ends_at` | `timestamp with time zone` | não |  |  | Coluna ends_at da tabela public.performance_bets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 12 | `resolved_at` | `timestamp with time zone` | sim |  |  | Coluna resolved_at da tabela public.performance_bets. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.performance_bets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.performance_bets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| performance_bets_bet_type_check | CHECK | `CHECK (bet_type = ANY (ARRAY['deals'::text, 'revenue'::text, 'calls'::text, 'meetings'::text, 'activities'::text]))` |  |  | sim |
| performance_bets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| performance_bets_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| performance_bets_status_check | CHECK | `CHECK (status = ANY (ARRAY['active'::text, 'won'::text, 'lost'::text, 'cancelled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_performance_bets_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_performance_bets_salesperson ON public.performance_bets USING btree (salesperson_id)` |
| idx_performance_bets_status | btree | status | não | sim |  | `CREATE INDEX idx_performance_bets_status ON public.performance_bets USING btree (status)` |
| performance_bets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX performance_bets_pkey ON public.performance_bets USING btree (id)` |


## Policies (RLS)

### `Users can insert own bets`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can read own or all bets`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1)) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own bets`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| update_performance_bets_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
