# public.performance_bets

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `bet_type` | `text` | não |  |  |  |
| 4 | `target_value` | `numeric` | não |  |  |  |
| 5 | `xp_wagered` | `integer` | não | `100` |  |  |
| 6 | `xp_multiplier` | `numeric` | não | `2.0` |  |  |
| 7 | `current_value` | `numeric` | não | `0` |  |  |
| 8 | `status` | `text` | não | `'active'::text` |  |  |
| 9 | `description` | `text` | sim |  |  |  |
| 10 | `starts_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `ends_at` | `timestamp with time zone` | não |  |  |  |
| 12 | `resolved_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
