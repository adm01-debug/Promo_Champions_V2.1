# public.webauthn_challenges

> Tabela public.webauthn_challenges. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NULLABLE, user_email text NULLABLE, challenge text NOT NULL, type text NOT NULL, expires_at timestamp with time zone NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.webauthn_challenges. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.webauthn_challenges. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `user_email` | `text` | sim |  |  | Coluna user_email da tabela public.webauthn_challenges. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `challenge` | `text` | não |  |  | Coluna challenge da tabela public.webauthn_challenges. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `type` | `text` | não |  |  | Coluna type da tabela public.webauthn_challenges. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (type = ANY (ARRAY['registration'::text, 'authentication'::text])). |
| 6 | `expires_at` | `timestamp with time zone` | não |  |  | Coluna expires_at da tabela public.webauthn_challenges. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.webauthn_challenges. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| fk_webauthn_challenges_user_id | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| webauthn_challenges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| webauthn_challenges_type_check | CHECK | `CHECK (type = ANY (ARRAY['registration'::text, 'authentication'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webauthn_challenges_expires | btree | expires_at | não | sim |  | `CREATE INDEX idx_webauthn_challenges_expires ON public.webauthn_challenges USING btree (expires_at)` |
| idx_webauthn_challenges_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_webauthn_challenges_user_id ON public.webauthn_challenges USING btree (user_id)` |
| webauthn_challenges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webauthn_challenges_pkey ON public.webauthn_challenges USING btree (id)` |


## Policies (RLS)

### `Users can delete own webauthn challenges`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can insert own webauthn challenges`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(user_id = auth.uid())` |

### `Users can read own webauthn challenges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
