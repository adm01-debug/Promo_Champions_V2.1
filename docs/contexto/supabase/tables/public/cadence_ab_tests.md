# public.cadence_ab_tests

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
| 4 | `variant_a_id` | `uuid` | não |  |  |  |
| 5 | `variant_b_id` | `uuid` | não |  |  |  |
| 6 | `traffic_split` | `integer` | não | `50` |  |  |
| 7 | `status` | `text` | não | `'draft'::text` |  |  |
| 8 | `hypothesis` | `text` | sim |  |  |  |
| 9 | `winner_variant` | `text` | sim |  |  |  |
| 10 | `started_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `ended_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_by` | `uuid` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_ab_tests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_ab_tests_variant_a_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_a_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_ab_tests_variant_b_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_b_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| chk_distinct_variants | CHECK | `CHECK (variant_a_id <> variant_b_id)` |  |  | sim |
| chk_split_range | CHECK | `CHECK (traffic_split >= 1 AND traffic_split <= 99)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_ab_assignments | cadence_ab_assignments_ab_test_id_fkey | ab_test_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_ab_tests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_ab_tests_pkey ON public.cadence_ab_tests USING btree (id)` |
| idx_cadence_ab_tests_variant_a_id | btree | variant_a_id | não | sim |  | `CREATE INDEX idx_cadence_ab_tests_variant_a_id ON public.cadence_ab_tests USING btree (variant_a_id)` |
| idx_cadence_ab_tests_variant_b_id | btree | variant_b_id | não | sim |  | `CREATE INDEX idx_cadence_ab_tests_variant_b_id ON public.cadence_ab_tests USING btree (variant_b_id)` |


## Policies (RLS)

### `Admins/managers manage ab tests`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated can view ab tests`

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
| update_ab_tests_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
