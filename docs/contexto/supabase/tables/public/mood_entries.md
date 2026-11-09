# public.mood_entries

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `entry_date` | `date` | não | `CURRENT_DATE` |  |  |
| 4 | `mood_value` | `integer` | não |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| mood_entries_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| mood_entries_salesperson_id_entry_date_key | UNIQUE | `UNIQUE (salesperson_id, entry_date)` |  |  | sim |
| mood_entries_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_mood_entries_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_mood_entries_salesperson_id ON public.mood_entries USING btree (salesperson_id)` |
| mood_entries_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX mood_entries_pkey ON public.mood_entries USING btree (id)` |
| mood_entries_salesperson_id_entry_date_key | btree | salesperson_id, entry_date | sim | sim |  | `CREATE UNIQUE INDEX mood_entries_salesperson_id_entry_date_key ON public.mood_entries USING btree (salesperson_id, entry_date)` |


## Policies (RLS)

### `Users can insert own mood entries`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |

### `Users can read own mood entries`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `Users can update own mood entries`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| check_mood_value | BEFORE | INSERT OR UPDATE | ROW | enabled | public.validate_mood_value |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
