# public.task_catalog

> Tabela public.task_catalog. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), title text NOT NULL, description text NULLABLE, category text NOT NULL DEFAULT 'general'::text, difficulty task_difficulty NOT NULL DEFAULT 'medium'::task_difficulty, xp_reward integer NOT NULL DEFAULT 50, active boolean NOT NULL DEFAULT true, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.task_catalog. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `title` | `text` | não |  |  | Coluna title da tabela public.task_catalog. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.task_catalog. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `category` | `text` | não | `'general'::text` |  | Coluna category da tabela public.task_catalog. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'general'::text. |
| 5 | `difficulty` | `task_difficulty` | não | `'medium'::task_difficulty` |  | Coluna difficulty da tabela public.task_catalog. Tipo PostgreSQL: task_difficulty. Não aceita NULL. Valor padrão: 'medium'::task_difficulty. Valores do enum: 'easy', 'medium', 'hard', 'epic'. |
| 6 | `xp_reward` | `integer` | não | `50` |  | Coluna xp_reward da tabela public.task_catalog. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. Validação CHECK: CHECK (xp_reward >= 0). |
| 7 | `active` | `boolean` | não | `true` |  | Coluna active da tabela public.task_catalog. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 8 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.task_catalog. Tipo PostgreSQL: uuid. Aceita NULL. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.task_catalog. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.task_catalog. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| task_catalog_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| task_catalog_xp_reward_check | CHECK | `CHECK (xp_reward >= 0)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.task_assignments | task_assignments_catalog_id_fkey | catalog_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| task_catalog_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX task_catalog_pkey ON public.task_catalog USING btree (id)` |


## Policies (RLS)

### `Admin can delete catalog`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admin can insert catalog`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admin can update catalog`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Anyone authenticated can view catalog`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_task_catalog_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
