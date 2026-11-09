# public.daily_challenges

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `title` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `challenge_type` | `text` | não | `'calls'::text` |  |  |
| 5 | `target_value` | `integer` | não | `5` |  |  |
| 6 | `xp_reward` | `integer` | não | `25` |  |  |
| 7 | `challenge_date` | `date` | não | `CURRENT_DATE` |  |  |
| 8 | `is_active` | `boolean` | não | `true` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| daily_challenges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.daily_challenge_progress | daily_challenge_progress_challenge_id_fkey | challenge_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| daily_challenges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX daily_challenges_pkey ON public.daily_challenges USING btree (id)` |
| idx_daily_challenges_active | btree | is_active | não | sim |  | `CREATE INDEX idx_daily_challenges_active ON public.daily_challenges USING btree (is_active)` |
| idx_daily_challenges_date | btree | challenge_date | não | sim |  | `CREATE INDEX idx_daily_challenges_date ON public.daily_challenges USING btree (challenge_date)` |
| idx_daily_challenges_date_active | btree | challenge_date, is_active | não | sim |  | `CREATE INDEX idx_daily_challenges_date_active ON public.daily_challenges USING btree (challenge_date, is_active)` |


## Policies (RLS)

### `Admins and managers can delete daily_challenges`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert daily_challenges`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update daily_challenges`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can view daily challenges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
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
