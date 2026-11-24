# public.experiments

> Tabela public.experiments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), name text NOT NULL, description text NULLABLE, is_active boolean NULLABLE DEFAULT true, start_date timestamp with time zone NULLABLE DEFAULT now(), end_date timestamp with time zone NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.experiments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.experiments. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.experiments. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.experiments. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 5 | `start_date` | `timestamp with time zone` | sim | `now()` |  | Coluna start_date da tabela public.experiments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 6 | `end_date` | `timestamp with time zone` | sim |  |  | Coluna end_date da tabela public.experiments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.experiments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| experiments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.experiment_assignments | experiment_assignments_experiment_id_fkey | experiment_id | CASCADE |
| public.experiment_variants | experiment_variants_experiment_id_fkey | experiment_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| experiments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX experiments_pkey ON public.experiments USING btree (id)` |


## Policies (RLS)

### `Admins and managers can manage experiments`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read experiments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
