# public.quota_attainment_actions

> Tabela public.quota_attainment_actions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), forecast_id uuid NOT NULL, action_type text NOT NULL, title text NOT NULL, description text NULLABLE, expected_impact numeric NOT NULL DEFAULT 0, priority integer NOT NULL DEFAULT 1, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: forecast_id → public.quota_attainment_forecasts(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.quota_attainment_actions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `forecast_id` | `uuid` | não |  |  | Coluna forecast_id da tabela public.quota_attainment_actions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.quota_attainment_forecasts(id). |
| 3 | `action_type` | `text` | não |  |  | Coluna action_type da tabela public.quota_attainment_actions. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (action_type = ANY (ARRAY['close_deal'::text, 'generate_pipeline'::text, 'increase_ticket'::text, 'accelerate_stage'::text])). |
| 4 | `title` | `text` | não |  |  | Coluna title da tabela public.quota_attainment_actions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `description` | `text` | sim |  |  | Coluna description da tabela public.quota_attainment_actions. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `expected_impact` | `numeric` | não | `0` |  | Coluna expected_impact da tabela public.quota_attainment_actions. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `priority` | `integer` | não | `1` |  | Coluna priority da tabela public.quota_attainment_actions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.quota_attainment_actions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quota_attainment_actions_action_type_check | CHECK | `CHECK (action_type = ANY (ARRAY['close_deal'::text, 'generate_pipeline'::text, 'increase_ticket'::text, 'accelerate_stage'::text]))` |  |  | sim |
| quota_attainment_actions_forecast_id_fkey | FOREIGN KEY | `FOREIGN KEY (forecast_id) REFERENCES quota_attainment_forecasts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| quota_attainment_actions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quota_actions_forecast | btree | forecast_id | não | sim |  | `CREATE INDEX idx_quota_actions_forecast ON public.quota_attainment_actions USING btree (forecast_id)` |
| idx_quota_actions_priority | btree | priority | não | sim |  | `CREATE INDEX idx_quota_actions_priority ON public.quota_attainment_actions USING btree (priority)` |
| quota_attainment_actions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quota_attainment_actions_pkey ON public.quota_attainment_actions USING btree (id)` |


## Policies (RLS)

### `Admins/managers manage quota actions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated can view quota actions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
