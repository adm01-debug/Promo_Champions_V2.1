# public.supplier_risk_assessments

> Avaliações de risco de fornecedores por data e dimensão de risco.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da avaliação. |
| 2 | `supplier_id` | `uuid` | sim |  |  | Fornecedor avaliado, quando identificado. |
| 3 | `assessment_date` | `date` | não | `CURRENT_DATE` |  | Data da avaliação de risco. |
| 4 | `financial_risk` | `numeric(3,2)` | sim | `0.5` |  | Pontuação ou indicador de risco financeiro; escala definida pela aplicação. |
| 5 | `delivery_risk` | `numeric(3,2)` | sim | `0.5` |  | Pontuação ou indicador de risco de entrega; escala definida pela aplicação. |
| 6 | `quality_risk` | `numeric(3,2)` | sim | `0.5` |  | Pontuação ou indicador de risco de qualidade; escala definida pela aplicação. |
| 7 | `overall_risk` | `numeric(3,2)` | sim | `0.5` |  | Indicador agregado de risco do fornecedor; escala definida pela aplicação. |
| 8 | `risk_level` | `text` | sim | `'medium'::text` |  | Nível de risco: low, medium, high ou critical. |
| 9 | `factors` | `jsonb` | sim | `'{}'::jsonb` |  | Fatores considerados na avaliação, em formato JSON. |
| 10 | `recommendations` | `text` | sim |  |  | Recomendações resultantes da avaliação. |
| 11 | `assessed_by` | `uuid` | sim |  |  | Usuário que realizou a avaliação, quando identificado. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do registro. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supplier_risk_assessments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supplier_risk_assessments_risk_level_check | CHECK | `CHECK (risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| supplier_risk_assessments_supplier_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supplier_risk_assessments_supplier | btree | supplier_id | não | sim |  | `CREATE INDEX idx_supplier_risk_assessments_supplier ON public.supplier_risk_assessments USING btree (supplier_id)` |
| supplier_risk_assessments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supplier_risk_assessments_pkey ON public.supplier_risk_assessments USING btree (id)` |


## Policies (RLS)

### `Admin/manager can view supplier_risk_assessments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert supplier_risk_assessments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update supplier_risk_assessments`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
