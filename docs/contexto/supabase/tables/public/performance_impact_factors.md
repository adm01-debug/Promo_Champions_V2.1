# public.performance_impact_factors

> Tabela public.performance_impact_factors. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, factor_name text NULLABLE, impact_score numeric(5,2) NULLABLE, description text NULLABLE, recorded_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.performance_impact_factors. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.performance_impact_factors. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `factor_name` | `text` | sim |  |  | Coluna factor_name da tabela public.performance_impact_factors. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `impact_score` | `numeric(5,2)` | sim |  |  | Coluna impact_score da tabela public.performance_impact_factors. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 5 | `description` | `text` | sim |  |  | Coluna description da tabela public.performance_impact_factors. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `recorded_at` | `timestamp with time zone` | sim | `now()` |  | Coluna recorded_at da tabela public.performance_impact_factors. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| performance_impact_factors_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| performance_impact_factors_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX performance_impact_factors_pkey ON public.performance_impact_factors USING btree (id)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
