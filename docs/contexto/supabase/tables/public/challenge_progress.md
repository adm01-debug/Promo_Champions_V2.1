# public.challenge_progress

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `challenge_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `current_value` | `integer` | não | `0` |  |  |
| 5 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `xp_claimed` | `boolean` | não | `false` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| challenge_progress_challenge_id_fkey | FOREIGN KEY | `FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| challenge_progress_challenge_id_salesperson_id_key | UNIQUE | `UNIQUE (challenge_id, salesperson_id)` |  |  | sim |
| challenge_progress_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| challenge_progress_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| challenge_progress_challenge_id_salesperson_id_key | btree | challenge_id, salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX challenge_progress_challenge_id_salesperson_id_key ON public.challenge_progress USING btree (challenge_id, salesperson_id)` |
| challenge_progress_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX challenge_progress_pkey ON public.challenge_progress USING btree (id)` |
| idx_challenge_progress_challenge_id | btree | challenge_id | não | sim |  | `CREATE INDEX idx_challenge_progress_challenge_id ON public.challenge_progress USING btree (challenge_id)` |
| idx_champ_challenge_progress_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_challenge_progress_salesperson_id ON public.challenge_progress USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can read own challenge_progress`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_challenge_progress_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
