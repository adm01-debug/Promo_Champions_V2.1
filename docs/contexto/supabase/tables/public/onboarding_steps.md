# public.onboarding_steps

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
| 2 | `journey_id` | `uuid` | não |  |  |  |
| 3 | `title` | `text` | não |  |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `order_index` | `integer` | não | `0` |  |  |
| 6 | `status` | `text` | não | `'pending'::text` |  |  |
| 7 | `due_date` | `date` | sim |  |  |  |
| 8 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| onboarding_steps_journey_id_fkey | FOREIGN KEY | `FOREIGN KEY (journey_id) REFERENCES onboarding_journeys(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| onboarding_steps_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_onboarding_steps_journey | btree | journey_id, order_index | não | sim |  | `CREATE INDEX idx_onboarding_steps_journey ON public.onboarding_steps USING btree (journey_id, order_index)` |
| onboarding_steps_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX onboarding_steps_pkey ON public.onboarding_steps USING btree (id)` |


## Policies (RLS)

### `cs_os_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` |

### `cs_os_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
