# public.pipeline_inspections

> Tabela public.pipeline_inspections. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, inspector_id uuid NULLABLE, status_at_inspection text NULLABLE, amount_at_inspection numeric NULLABLE, forecast_category_at_inspection forecast_category NULLABLE, notes text NULLABLE, risk_signals jsonb NULLABLE, next_steps_agreed text[] NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: inspector_id → auth.users(id); sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pipeline_inspections. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.pipeline_inspections. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `inspector_id` | `uuid` | sim |  |  | Coluna inspector_id da tabela public.pipeline_inspections. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 4 | `status_at_inspection` | `text` | sim |  |  | Coluna status_at_inspection da tabela public.pipeline_inspections. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `amount_at_inspection` | `numeric` | sim |  |  | Coluna amount_at_inspection da tabela public.pipeline_inspections. Tipo PostgreSQL: numeric. Aceita NULL. |
| 6 | `forecast_category_at_inspection` | `forecast_category` | sim |  |  | Coluna forecast_category_at_inspection da tabela public.pipeline_inspections. Tipo PostgreSQL: forecast_category. Aceita NULL. Valores do enum: 'commit', 'best_case', 'pipeline', 'omitted', 'closed'. |
| 7 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.pipeline_inspections. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `risk_signals` | `jsonb` | sim |  |  | Coluna risk_signals da tabela public.pipeline_inspections. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 9 | `next_steps_agreed` | `text[]` | sim |  |  | Coluna next_steps_agreed da tabela public.pipeline_inspections. Tipo PostgreSQL: text[]. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.pipeline_inspections. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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
