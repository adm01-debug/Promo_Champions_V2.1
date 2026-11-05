# public.lead_churn_risk

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
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `risk_level` | `text` | sim |  |  |  |
| 4 | `risk_score` | `numeric` | sim |  |  |  |
| 5 | `factors` | `jsonb` | sim |  |  |  |
| 6 | `detected_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 7 | `status` | `text` | sim | `'active'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_churn_risk_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_churn_risk_risk_level_check | CHECK | `CHECK (risk_level = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text]))` |  |  | sim |
| lead_churn_risk_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_churn_risk_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |
| lead_churn_risk_status_check | CHECK | `CHECK (status = ANY (ARRAY['active'::text, 'resolved'::text, 'ignored'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_churn_risk_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_churn_risk_pkey ON public.lead_churn_risk USING btree (id)` |
| lead_churn_risk_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX lead_churn_risk_sale_id_key ON public.lead_churn_risk USING btree (sale_id)` |


## Policies (RLS)

### `Admins and managers can read lead_churn_risk`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Salespeople can read churn risk of their sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_churn_risk.sale_id) AND (sp.auth_user_id = auth.uid()))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
