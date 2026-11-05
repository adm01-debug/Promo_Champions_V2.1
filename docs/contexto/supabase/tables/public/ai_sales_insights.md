# public.ai_sales_insights

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
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `insight_type` | `text` | não |  |  |  |
| 4 | `insight_content` | `jsonb` | não |  |  |  |
| 5 | `confidence_score` | `double precision` | sim | `0` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ai_sales_insights_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| ai_sales_insights_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ai_sales_insights_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ai_sales_insights_pkey ON public.ai_sales_insights USING btree (id)` |
| idx_ai_sales_insights_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_ai_sales_insights_sale_id ON public.ai_sales_insights USING btree (sale_id)` |


## Policies (RLS)

### `Users can view insights for their sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = ai_sales_insights.sale_id) AND (sales.salesperson_id = auth.uid()))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
