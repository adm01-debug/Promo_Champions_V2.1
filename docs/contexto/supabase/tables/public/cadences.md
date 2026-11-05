# public.cadences

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `is_active` | `boolean` | não | `true` |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `cadence_type` | `cadence_type` | não | `'prospecting'::cadence_type` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_ab_tests | cadence_ab_tests_variant_a_id_fkey | variant_a_id | CASCADE |
| public.cadence_ab_tests | cadence_ab_tests_variant_b_id_fkey | variant_b_id | CASCADE |
| public.cadence_advanced_stats | cadence_advanced_stats_cadence_id_fkey | cadence_id | CASCADE |
| public.cadence_enrollment_rules | cadence_enrollment_rules_cadence_id_fkey | cadence_id | CASCADE |
| public.cadence_funnel_rules | cadence_funnel_rules_cadence_id_fkey | cadence_id | CASCADE |
| public.cadence_steps | cadence_steps_cadence_id_fkey | cadence_id | CASCADE |
| public.prospect_cadences | prospect_cadences_cadence_id_fkey | cadence_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadences_pkey ON public.cadences USING btree (id)` |
| idx_cadences_type | btree | cadence_type | não | sim |  | `CREATE INDEX idx_cadences_type ON public.cadences USING btree (cadence_type)` |


## Policies (RLS)

### `Admins and managers can delete cadences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert cadences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update cadences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read cadences`

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
| update_cadences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
