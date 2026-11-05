# public.supplier_risk_assessments

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `supplier_id` | `uuid` | sim |  |  |  |
| 3 | `assessment_date` | `date` | não | `CURRENT_DATE` |  |  |
| 4 | `financial_risk` | `numeric(3,2)` | sim | `0.5` |  |  |
| 5 | `delivery_risk` | `numeric(3,2)` | sim | `0.5` |  |  |
| 6 | `quality_risk` | `numeric(3,2)` | sim | `0.5` |  |  |
| 7 | `overall_risk` | `numeric(3,2)` | sim | `0.5` |  |  |
| 8 | `risk_level` | `text` | sim | `'medium'::text` |  |  |
| 9 | `factors` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 10 | `recommendations` | `text` | sim |  |  |  |
| 11 | `assessed_by` | `uuid` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
