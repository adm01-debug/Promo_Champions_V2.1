# public.account_activities

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
| 2 | `account_id` | `uuid` | não |  |  |  |
| 3 | `contact_id` | `uuid` | sim |  |  |  |
| 4 | `salesperson_id` | `uuid` | sim |  |  |  |
| 5 | `activity_type` | `text` | não |  |  |  |
| 6 | `title` | `text` | não |  |  |  |
| 7 | `description` | `text` | sim |  |  |  |
| 8 | `occurred_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| account_activities_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| account_activities_contact_id_fkey | FOREIGN KEY | `FOREIGN KEY (contact_id) REFERENCES account_contacts(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| account_activities_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| account_activities_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| account_activities_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX account_activities_pkey ON public.account_activities USING btree (id)` |
| idx_account_activities_account | btree | account_id, occurred_at | não | sim |  | `CREATE INDEX idx_account_activities_account ON public.account_activities USING btree (account_id, occurred_at DESC)` |
| idx_account_activities_contact_id | btree | contact_id | não | sim |  | `CREATE INDEX idx_account_activities_contact_id ON public.account_activities USING btree (contact_id)` |
| idx_account_activities_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_account_activities_salesperson_id ON public.account_activities USING btree (salesperson_id)` |


## Policies (RLS)

### `Insert activities for accessible accounts`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_activities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |

### `View activities of accessible accounts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_activities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
