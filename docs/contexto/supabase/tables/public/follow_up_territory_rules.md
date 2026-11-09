# public.follow_up_territory_rules

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
| 2 | `territory` | `text` | sim |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `cadence_id` | `uuid` | sim |  |  |  |
| 5 | `whatsapp_template_id` | `uuid` | sim |  |  |  |
| 6 | `priority` | `integer` | sim | `0` |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_territory_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| follow_up_territory_rules_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_territory_rules_whatsapp_template_id_fkey | FOREIGN KEY | `FOREIGN KEY (whatsapp_template_id) REFERENCES follow_up_templates(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_territory_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_territory_rules_pkey ON public.follow_up_territory_rules USING btree (id)` |
| idx_follow_up_territory_rules_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_follow_up_territory_rules_salesperson_id ON public.follow_up_territory_rules USING btree (salesperson_id)` |
| idx_follow_up_territory_rules_whatsapp_template_id | btree | whatsapp_template_id | não | sim |  | `CREATE INDEX idx_follow_up_territory_rules_whatsapp_template_id ON public.follow_up_territory_rules USING btree (whatsapp_template_id)` |


## Policies (RLS)

### `Admins can manage territory rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |
| WITH CHECK |  |

### `Users can view their own territory rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = auth.uid()) OR (salesperson_id IS NULL))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_follow_up_territory_rules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
