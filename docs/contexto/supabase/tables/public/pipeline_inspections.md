# public.pipeline_inspections

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
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `inspector_id` | `uuid` | sim |  |  |  |
| 4 | `status_at_inspection` | `text` | sim |  |  |  |
| 5 | `amount_at_inspection` | `numeric` | sim |  |  |  |
| 6 | `forecast_category_at_inspection` | `forecast_category` | sim |  |  |  |
| 7 | `notes` | `text` | sim |  |  |  |
| 8 | `risk_signals` | `jsonb` | sim |  |  |  |
| 9 | `next_steps_agreed` | `text[]` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_inspections_inspector_id_fkey | FOREIGN KEY | `FOREIGN KEY (inspector_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| pipeline_inspections_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| pipeline_inspections_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pipeline_inspections_inspector_id | btree | inspector_id | não | sim |  | `CREATE INDEX idx_pipeline_inspections_inspector_id ON public.pipeline_inspections USING btree (inspector_id)` |
| idx_pipeline_inspections_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_pipeline_inspections_sale_id ON public.pipeline_inspections USING btree (sale_id)` |
| pipeline_inspections_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_inspections_pkey ON public.pipeline_inspections USING btree (id)` |


## Policies (RLS)

### `Managers can create inspections`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |

### `Users can view inspections for their sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = pipeline_inspections.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
