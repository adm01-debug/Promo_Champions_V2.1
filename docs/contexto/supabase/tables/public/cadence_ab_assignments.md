# public.cadence_ab_assignments

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
| 2 | `ab_test_id` | `uuid` | não |  |  |  |
| 3 | `prospect_cadence_id` | `uuid` | não |  |  |  |
| 4 | `variant` | `text` | não |  |  |  |
| 5 | `assigned_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_ab_assignments_ab_test_id_fkey | FOREIGN KEY | `FOREIGN KEY (ab_test_id) REFERENCES cadence_ab_tests(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_ab_assignments_ab_test_id_prospect_cadence_id_key | UNIQUE | `UNIQUE (ab_test_id, prospect_cadence_id)` |  |  | sim |
| cadence_ab_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_ab_assignments_prospect_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (prospect_cadence_id) REFERENCES prospect_cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_ab_assignments_variant_check | CHECK | `CHECK (variant = ANY (ARRAY['a'::text, 'b'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_ab_assignments_ab_test_id_prospect_cadence_id_key | btree | ab_test_id, prospect_cadence_id | sim | sim |  | `CREATE UNIQUE INDEX cadence_ab_assignments_ab_test_id_prospect_cadence_id_key ON public.cadence_ab_assignments USING btree (ab_test_id, prospect_cadence_id)` |
| cadence_ab_assignments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_ab_assignments_pkey ON public.cadence_ab_assignments USING btree (id)` |
| idx_ab_assignments_test | btree | ab_test_id, variant | não | sim |  | `CREATE INDEX idx_ab_assignments_test ON public.cadence_ab_assignments USING btree (ab_test_id, variant)` |
| idx_champ_cadence_ab_assignments_cadence_id | btree | prospect_cadence_id | não | sim |  | `CREATE INDEX idx_champ_cadence_ab_assignments_cadence_id ON public.cadence_ab_assignments USING btree (prospect_cadence_id)` |


## Policies (RLS)

### `Admins/managers manage ab assignments`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated can view ab assignments`

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

_nenhum_
