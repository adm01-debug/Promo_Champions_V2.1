# public.stage_inactivity_rules

> Tabela public.stage_inactivity_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), stage text NOT NULL, label text NOT NULL, mild_days integer NOT NULL, moderate_days integer NOT NULL, critical_days integer NOT NULL, enabled boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.stage_inactivity_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `stage` | `text` | não |  |  | Coluna stage da tabela public.stage_inactivity_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `label` | `text` | não |  |  | Coluna label da tabela public.stage_inactivity_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `mild_days` | `integer` | não |  |  | Coluna mild_days da tabela public.stage_inactivity_rules. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (moderate_days > mild_days); CHECK (mild_days > 0). |
| 5 | `moderate_days` | `integer` | não |  |  | Coluna moderate_days da tabela public.stage_inactivity_rules. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (moderate_days > mild_days); CHECK (critical_days > moderate_days). |
| 6 | `critical_days` | `integer` | não |  |  | Coluna critical_days da tabela public.stage_inactivity_rules. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (critical_days > moderate_days). |
| 7 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.stage_inactivity_rules. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.stage_inactivity_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.stage_inactivity_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_inactivity_rules_check | CHECK | `CHECK (moderate_days > mild_days)` |  |  | sim |
| stage_inactivity_rules_check1 | CHECK | `CHECK (critical_days > moderate_days)` |  |  | sim |
| stage_inactivity_rules_mild_days_check | CHECK | `CHECK (mild_days > 0)` |  |  | sim |
| stage_inactivity_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| stage_inactivity_rules_stage_key | UNIQUE | `UNIQUE (stage)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| stage_inactivity_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stage_inactivity_rules_pkey ON public.stage_inactivity_rules USING btree (id)` |
| stage_inactivity_rules_stage_key | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX stage_inactivity_rules_stage_key ON public.stage_inactivity_rules USING btree (stage)` |


## Policies (RLS)

### `Authenticated can read stage inactivity rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage stage inactivity rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_stage_inactivity_rules_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
