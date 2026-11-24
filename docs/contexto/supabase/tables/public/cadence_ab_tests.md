# public.cadence_ab_tests

> Tabela public.cadence_ab_tests. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text NULLABLE, variant_a_id uuid NOT NULL, variant_b_id uuid NOT NULL, traffic_split integer NOT NULL DEFAULT 50, status text NOT NULL DEFAULT 'draft'::text, hypothesis text NULLABLE, winner_variant text NULLABLE, started_at timestamp with time zone NULLABLE, ended_at timestamp with time zone NULLABLE, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: variant_a_id → public.cadences(id); variant_b_id → public.cadences(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cadence_ab_tests. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.cadence_ab_tests. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.cadence_ab_tests. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `variant_a_id` | `uuid` | não |  |  | Coluna variant_a_id da tabela public.cadence_ab_tests. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.cadences(id). Validação CHECK: CHECK (variant_a_id <> variant_b_id). |
| 5 | `variant_b_id` | `uuid` | não |  |  | Coluna variant_b_id da tabela public.cadence_ab_tests. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.cadences(id). Validação CHECK: CHECK (variant_a_id <> variant_b_id). |
| 6 | `traffic_split` | `integer` | não | `50` |  | Coluna traffic_split da tabela public.cadence_ab_tests. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. Validação CHECK: CHECK (traffic_split >= 1 AND traffic_split <= 99). |
| 7 | `status` | `text` | não | `'draft'::text` |  | Coluna status da tabela public.cadence_ab_tests. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'draft'::text. |
| 8 | `hypothesis` | `text` | sim |  |  | Coluna hypothesis da tabela public.cadence_ab_tests. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `winner_variant` | `text` | sim |  |  | Coluna winner_variant da tabela public.cadence_ab_tests. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `started_at` | `timestamp with time zone` | sim |  |  | Coluna started_at da tabela public.cadence_ab_tests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `ended_at` | `timestamp with time zone` | sim |  |  | Coluna ended_at da tabela public.cadence_ab_tests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.cadence_ab_tests. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.cadence_ab_tests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.cadence_ab_tests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
