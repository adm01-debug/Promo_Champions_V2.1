# public.commission_bonuses

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `bonus_type` | `text` | não |  |  |  |
| 5 | `trigger_condition` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `bonus_amount` | `numeric(14,2)` | não | `0` |  |  |
| 7 | `bonus_kind` | `text` | não | `'fixed'::text` |  |  |
| 8 | `salesperson_id` | `uuid` | sim |  |  |  |
| 9 | `priority` | `integer` | não | `0` |  |  |
| 10 | `is_active` | `boolean` | não | `true` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commission_bonuses_bonus_amount_check | CHECK | `CHECK (bonus_amount >= 0::numeric)` |  |  | sim |
| commission_bonuses_bonus_kind_check | CHECK | `CHECK (bonus_kind = ANY (ARRAY['fixed'::text, 'percentage'::text]))` |  |  | sim |
| commission_bonuses_bonus_type_check | CHECK | `CHECK (bonus_type = ANY (ARRAY['first_sale'::text, 'milestone'::text, 'ranking'::text, 'streak'::text, 'other'::text]))` |  |  | sim |
| commission_bonuses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commission_bonuses_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.commission_bonus_awards | commission_bonus_awards_bonus_id_fkey | bonus_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commission_bonuses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commission_bonuses_pkey ON public.commission_bonuses USING btree (id)` |
| idx_commission_bonuses_active | btree | is_active, priority | não | sim | `(is_active = true)` | `CREATE INDEX idx_commission_bonuses_active ON public.commission_bonuses USING btree (is_active, priority DESC) WHERE (is_active = true)` |
| idx_commission_bonuses_salesperson | btree | salesperson_id | não | sim | `(salesperson_id IS NOT NULL)` | `CREATE INDEX idx_commission_bonuses_salesperson ON public.commission_bonuses USING btree (salesperson_id) WHERE (salesperson_id IS NOT NULL)` |


## Policies (RLS)

### `Admins and managers manage commission_bonuses`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Salespeople view applicable active bonuses`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((is_active = true) AND ((salesperson_id IS NULL) OR (salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| update_commission_bonuses_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
