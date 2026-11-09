# public.cadence_enrollment_rules

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
| 2 | `cadence_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `is_active` | `boolean` | não | `true` |  |  |
| 6 | `priority` | `integer` | não | `100` |  |  |
| 7 | `trigger_stage` | `text` | sim |  |  |  |
| 8 | `trigger_category` | `text` | sim |  |  |  |
| 9 | `trigger_source` | `text` | sim |  |  |  |
| 10 | `min_amount` | `numeric(12,2)` | sim |  |  |  |
| 11 | `max_amount` | `numeric(12,2)` | sim |  |  |  |
| 12 | `created_by` | `uuid` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_enrollment_rules_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_enrollment_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.prospect_cadences | prospect_cadences_enrolled_via_rule_id_fkey | enrolled_via_rule_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_enrollment_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_enrollment_rules_pkey ON public.cadence_enrollment_rules USING btree (id)` |
| idx_enrollment_rules_active | btree | is_active, priority | não | sim | `(is_active = true)` | `CREATE INDEX idx_enrollment_rules_active ON public.cadence_enrollment_rules USING btree (is_active, priority) WHERE (is_active = true)` |
| idx_enrollment_rules_cadence | btree | cadence_id | não | sim |  | `CREATE INDEX idx_enrollment_rules_cadence ON public.cadence_enrollment_rules USING btree (cadence_id)` |


## Policies (RLS)

### `Admins/managers can manage enrollment rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated can view enrollment rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_enrollment_rules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
