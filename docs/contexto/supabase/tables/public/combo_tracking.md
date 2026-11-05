# public.combo_tracking

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
| 3 | `combo_date` | `date` | não | `CURRENT_DATE` |  |  |
| 4 | `actions_count` | `integer` | não | `0` |  |  |
| 5 | `current_multiplier` | `numeric(3,1)` | não | `1.0` |  |  |
| 6 | `current_tier` | `integer` | não | `0` |  |  |
| 7 | `max_tier_today` | `integer` | não | `0` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| combo_tracking_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| combo_tracking_salesperson_id_combo_date_key | UNIQUE | `UNIQUE (salesperson_id, combo_date)` |  |  | sim |
| combo_tracking_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| combo_tracking_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX combo_tracking_pkey ON public.combo_tracking USING btree (id)` |
| combo_tracking_salesperson_id_combo_date_key | btree | salesperson_id, combo_date | sim | sim |  | `CREATE UNIQUE INDEX combo_tracking_salesperson_id_combo_date_key ON public.combo_tracking USING btree (salesperson_id, combo_date)` |
| idx_combo_tracking_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_combo_tracking_salesperson_id ON public.combo_tracking USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update combo_tracking`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Anyone can read combo_tracking`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can insert own combo_tracking`

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

_nenhum_
