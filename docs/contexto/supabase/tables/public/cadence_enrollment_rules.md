# public.cadence_enrollment_rules

> Tabela public.cadence_enrollment_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), cadence_id uuid NOT NULL, name text NOT NULL, description text NULLABLE, is_active boolean NOT NULL DEFAULT true, priority integer NOT NULL DEFAULT 100, trigger_stage text NULLABLE, trigger_category text NULLABLE, trigger_source text NULLABLE, min_amount numeric(12,2) NULLABLE, max_amount numeric(12,2) NULLABLE, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: cadence_id → public.cadences(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `cadence_id` | `uuid` | não |  |  | Coluna cadence_id da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.cadences(id). |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 6 | `priority` | `integer` | não | `100` |  | Coluna priority da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 100. |
| 7 | `trigger_stage` | `text` | sim |  |  | Coluna trigger_stage da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `trigger_category` | `text` | sim |  |  | Coluna trigger_category da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `trigger_source` | `text` | sim |  |  | Coluna trigger_source da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `min_amount` | `numeric(12,2)` | sim |  |  | Coluna min_amount da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 11 | `max_amount` | `numeric(12,2)` | sim |  |  | Coluna max_amount da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 12 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.cadence_enrollment_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
