# public._internal_secrets

> Tabela public._internal_secrets. Estrutura registrada no catálogo do PostgreSQL: key text NOT NULL, value text NOT NULL, updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `key` | `text` | não |  |  | Coluna key da tabela public._internal_secrets. Tipo PostgreSQL: text. Participa da chave primária. Não aceita NULL. |
| 2 | `value` | `text` | não |  |  | Coluna value da tabela public._internal_secrets. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public._internal_secrets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| _internal_secrets_pkey | PRIMARY KEY | `PRIMARY KEY (key)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| _internal_secrets_pkey | btree | key | sim | sim |  | `CREATE UNIQUE INDEX _internal_secrets_pkey ON public._internal_secrets USING btree (key)` |


## Policies (RLS)

### `Deny all access to _internal_secrets`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | anon, authenticated |
| USING | `false` |
| WITH CHECK | `false` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
