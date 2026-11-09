# public.follow_up_templates

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `content` | `text` | não |  |  |  |
| 4 | `variables` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 5 | `version` | `integer` | sim | `1` |  |  |
| 6 | `is_active` | `boolean` | sim | `true` |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `created_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_templates_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_templates_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.follow_up_territory_rules | follow_up_territory_rules_whatsapp_template_id_fkey | whatsapp_template_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_templates_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_templates_pkey ON public.follow_up_templates USING btree (id)` |
| idx_follow_up_templates_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_follow_up_templates_created_by ON public.follow_up_templates USING btree (created_by)` |


## Policies (RLS)

### `Admins can manage templates`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |
| WITH CHECK |  |

### `Authenticated users can view active templates`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_active = true)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_follow_up_templates_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
