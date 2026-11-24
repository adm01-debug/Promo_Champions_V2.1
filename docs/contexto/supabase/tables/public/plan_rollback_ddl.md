# public.plan_rollback_ddl

> Tabela public.plan_rollback_ddl. Estrutura registrada no catálogo do PostgreSQL: id bigint NOT NULL DEFAULT nextval('plan_rollback_ddl_id_seq'::regclass), etapa integer NOT NULL, object_type text NOT NULL, object_name text NOT NULL, ddl text NULLABLE, captured_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `bigint` | não | `nextval('plan_rollback_ddl_id_seq'::regclass)` |  | Coluna id da tabela public.plan_rollback_ddl. Tipo PostgreSQL: bigint. Participa da chave primária. Não aceita NULL. Valor padrão: nextval('plan_rollback_ddl_id_seq'::regclass). |
| 2 | `etapa` | `integer` | não |  |  | Coluna etapa da tabela public.plan_rollback_ddl. Tipo PostgreSQL: integer. Não aceita NULL. |
| 3 | `object_type` | `text` | não |  |  | Coluna object_type da tabela public.plan_rollback_ddl. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `object_name` | `text` | não |  |  | Coluna object_name da tabela public.plan_rollback_ddl. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `ddl` | `text` | sim |  |  | Coluna ddl da tabela public.plan_rollback_ddl. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `captured_at` | `timestamp with time zone` | sim | `now()` |  | Coluna captured_at da tabela public.plan_rollback_ddl. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| plan_rollback_ddl_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| plan_rollback_ddl_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX plan_rollback_ddl_pkey ON public.plan_rollback_ddl USING btree (id)` |


## Policies (RLS)

### `Internal admin only - service_role bypasses RLS`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | service_role |
| USING | `true` |
| WITH CHECK | `true` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
