# public.forecast_deal_contributions

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `forecast_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | não |  |  |  |
| 4 | `category` | `text` | não |  |  |  |
| 5 | `weighted_amount` | `numeric` | não | `0` |  |  |
| 6 | `probability` | `numeric` | não | `0` |  |  |
| 7 | `reasoning` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_deal_contributions_category_check | CHECK | `CHECK (category = ANY (ARRAY['commit'::text, 'best'::text, 'upside'::text, 'omitted'::text]))` |  |  | sim |
| forecast_deal_contributions_forecast_id_fkey | FOREIGN KEY | `FOREIGN KEY (forecast_id) REFERENCES revenue_forecasts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| forecast_deal_contributions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| forecast_deal_contributions_probability_check | CHECK | `CHECK (probability >= 0::numeric AND probability <= 1::numeric)` |  |  | sim |
| forecast_deal_contributions_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_deal_contributions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_deal_contributions_pkey ON public.forecast_deal_contributions USING btree (id)` |
| idx_forecast_contrib_forecast | btree | forecast_id, category | não | sim |  | `CREATE INDEX idx_forecast_contrib_forecast ON public.forecast_deal_contributions USING btree (forecast_id, category)` |
| idx_forecast_contrib_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_forecast_contrib_sale ON public.forecast_deal_contributions USING btree (sale_id)` |


## Policies (RLS)

### `Managers manage contributions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `View forecast contributions via forecast access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM revenue_forecasts rf   WHERE ((rf.id = forecast_deal_contributions.forecast_id) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (rf.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
