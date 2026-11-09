# public.cadence_alert_templates

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `type` | `text` | não |  |  |  |
| 4 | `subject` | `text` | sim |  |  |  |
| 5 | `content` | `text` | não |  |  |  |
| 6 | `is_default` | `boolean` | sim | `false` |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `start_time` | `time without time zone` | sim | `'09:00:00'::time without time zone` |  |  |
| 10 | `end_time` | `time without time zone` | sim | `'18:00:00'::time without time zone` |  |  |
| 11 | `days_of_week` | `text[]` | sim | `ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text]` |  |  |
| 12 | `timezone` | `text` | sim | `'America/Sao_Paulo'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_alert_templates_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_alert_templates_type_check | CHECK | `CHECK (type = ANY (ARRAY['push'::text, 'email'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_outcome_rules | cadence_outcome_rules_email_template_id_fkey | email_template_id | SET NULL |
| public.cadence_outcome_rules | cadence_outcome_rules_push_template_id_fkey | push_template_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_alert_templates_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_alert_templates_pkey ON public.cadence_alert_templates USING btree (id)` |


## Policies (RLS)

### `Authenticated read for alert templates`

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
