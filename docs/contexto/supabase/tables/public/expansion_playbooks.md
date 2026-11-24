# public.expansion_playbooks

> Tabela public.expansion_playbooks. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text NULLABLE, trigger_type text NOT NULL DEFAULT 'usage_threshold'::text, trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb, recommended_action text NULLABLE, expansion_type expansion_type NOT NULL DEFAULT 'upsell'::expansion_type, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.expansion_playbooks. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.expansion_playbooks. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.expansion_playbooks. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `trigger_type` | `text` | não | `'usage_threshold'::text` |  | Coluna trigger_type da tabela public.expansion_playbooks. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'usage_threshold'::text. |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  | Coluna trigger_config da tabela public.expansion_playbooks. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 6 | `recommended_action` | `text` | sim |  |  | Coluna recommended_action da tabela public.expansion_playbooks. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `expansion_type` | `expansion_type` | não | `'upsell'::expansion_type` |  | Coluna expansion_type da tabela public.expansion_playbooks. Tipo PostgreSQL: expansion_type. Não aceita NULL. Valor padrão: 'upsell'::expansion_type. Valores do enum: 'upsell', 'cross_sell', 'expansion'. |
| 8 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.expansion_playbooks. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.expansion_playbooks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.expansion_playbooks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| expansion_playbooks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.expansion_opportunities | expansion_opportunities_playbook_id_fkey | playbook_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| expansion_playbooks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX expansion_playbooks_pkey ON public.expansion_playbooks USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view expansion playbooks`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `cs_ep_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_exp_playbooks_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
