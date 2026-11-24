# public.forecast_deal_contributions

> Tabela public.forecast_deal_contributions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), forecast_id uuid NOT NULL, sale_id uuid NOT NULL, category text NOT NULL, weighted_amount numeric NOT NULL DEFAULT 0, probability numeric NOT NULL DEFAULT 0, reasoning text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: forecast_id → public.revenue_forecasts(id); sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.forecast_deal_contributions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `forecast_id` | `uuid` | não |  |  | Coluna forecast_id da tabela public.forecast_deal_contributions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.revenue_forecasts(id). |
| 3 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.forecast_deal_contributions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 4 | `category` | `text` | não |  |  | Coluna category da tabela public.forecast_deal_contributions. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (category = ANY (ARRAY['commit'::text, 'best'::text, 'upside'::text, 'omitted'::text])). |
| 5 | `weighted_amount` | `numeric` | não | `0` |  | Coluna weighted_amount da tabela public.forecast_deal_contributions. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `probability` | `numeric` | não | `0` |  | Coluna probability da tabela public.forecast_deal_contributions. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (probability >= 0::numeric AND probability <= 1::numeric). |
| 7 | `reasoning` | `text` | sim |  |  | Coluna reasoning da tabela public.forecast_deal_contributions. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.forecast_deal_contributions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
