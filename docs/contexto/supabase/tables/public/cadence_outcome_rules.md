# public.cadence_outcome_rules

> Tabela public.cadence_outcome_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), outcome text NOT NULL, to_stage text NOT NULL, next_action text NULLABLE, retry_delay_hours integer NULLABLE DEFAULT 0, max_retries integer NULLABLE DEFAULT 1, fallback_action text NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(), push_template_id uuid NULLABLE, email_template_id uuid NULLABLE, timezone text NULLABLE DEFAULT 'America/Sao_Paulo'::text. Relacionamentos FK: email_template_id → public.cadence_alert_templates(id); push_template_id → public.cadence_alert_templates(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cadence_outcome_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `outcome` | `text` | não |  |  | Coluna outcome da tabela public.cadence_outcome_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `to_stage` | `text` | não |  |  | Coluna to_stage da tabela public.cadence_outcome_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `next_action` | `text` | sim |  |  | Coluna next_action da tabela public.cadence_outcome_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `retry_delay_hours` | `integer` | sim | `0` |  | Coluna retry_delay_hours da tabela public.cadence_outcome_rules. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 6 | `max_retries` | `integer` | sim | `1` |  | Coluna max_retries da tabela public.cadence_outcome_rules. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 1. |
| 7 | `fallback_action` | `text` | sim |  |  | Coluna fallback_action da tabela public.cadence_outcome_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.cadence_outcome_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.cadence_outcome_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 10 | `push_template_id` | `uuid` | sim |  |  | Coluna push_template_id da tabela public.cadence_outcome_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.cadence_alert_templates(id). |
| 11 | `email_template_id` | `uuid` | sim |  |  | Coluna email_template_id da tabela public.cadence_outcome_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.cadence_alert_templates(id). |
| 12 | `timezone` | `text` | sim | `'America/Sao_Paulo'::text` |  | Coluna timezone da tabela public.cadence_outcome_rules. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'America/Sao_Paulo'::text. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_outcome_rules_email_template_id_fkey | FOREIGN KEY | `FOREIGN KEY (email_template_id) REFERENCES cadence_alert_templates(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| cadence_outcome_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_outcome_rules_push_template_id_fkey | FOREIGN KEY | `FOREIGN KEY (push_template_id) REFERENCES cadence_alert_templates(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_outcome_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_outcome_rules_pkey ON public.cadence_outcome_rules USING btree (id)` |
| idx_cadence_outcome_rules_email_template_id | btree | email_template_id | não | sim |  | `CREATE INDEX idx_cadence_outcome_rules_email_template_id ON public.cadence_outcome_rules USING btree (email_template_id)` |
| idx_cadence_outcome_rules_outcome | btree | outcome | não | sim |  | `CREATE INDEX idx_cadence_outcome_rules_outcome ON public.cadence_outcome_rules USING btree (outcome)` |
| idx_cadence_outcome_rules_push_template_id | btree | push_template_id | não | sim |  | `CREATE INDEX idx_cadence_outcome_rules_push_template_id ON public.cadence_outcome_rules USING btree (push_template_id)` |


## Policies (RLS)

### `Authenticated read for outcome rules`

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


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
