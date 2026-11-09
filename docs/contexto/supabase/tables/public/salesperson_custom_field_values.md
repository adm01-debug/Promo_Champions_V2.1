# public.salesperson_custom_field_values

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `field_id` | `uuid` | não |  |  |  |
| 4 | `numeric_value` | `numeric` | sim | `0` |  |  |
| 5 | `text_value` | `text` | sim |  |  |  |
| 6 | `boolean_value` | `boolean` | sim | `false` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_custom_field_values_field_id_fkey | FOREIGN KEY | `FOREIGN KEY (field_id) REFERENCES team_custom_fields(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_custom_field_values_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_custom_field_values_salesperson_id_field_id_key | UNIQUE | `UNIQUE (salesperson_id, field_id)` |  |  | sim |
| salesperson_custom_field_values_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_salesperson_custom_field_values_field_id | btree | field_id | não | sim |  | `CREATE INDEX idx_champ_salesperson_custom_field_values_field_id ON public.salesperson_custom_field_values USING btree (field_id)` |
| idx_salesperson_custom_field_values_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_salesperson_custom_field_values_salesperson_id ON public.salesperson_custom_field_values USING btree (salesperson_id)` |
| salesperson_custom_field_values_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_custom_field_values_pkey ON public.salesperson_custom_field_values USING btree (id)` |
| salesperson_custom_field_values_salesperson_id_field_id_key | btree | salesperson_id, field_id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_custom_field_values_salesperson_id_field_id_key ON public.salesperson_custom_field_values USING btree (salesperson_id, field_id)` |


## Policies (RLS)

### `Admins can manage field values`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Own or admin can view field values`

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


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
