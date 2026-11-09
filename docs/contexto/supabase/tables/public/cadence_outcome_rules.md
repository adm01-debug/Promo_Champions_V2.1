# public.cadence_outcome_rules

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `outcome` | `text` | não |  |  |  |
| 3 | `to_stage` | `text` | não |  |  |  |
| 4 | `next_action` | `text` | sim |  |  |  |
| 5 | `retry_delay_hours` | `integer` | sim | `0` |  |  |
| 6 | `max_retries` | `integer` | sim | `1` |  |  |
| 7 | `fallback_action` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 10 | `push_template_id` | `uuid` | sim |  |  |  |
| 11 | `email_template_id` | `uuid` | sim |  |  |  |
| 12 | `timezone` | `text` | sim | `'America/Sao_Paulo'::text` |  |  |


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
