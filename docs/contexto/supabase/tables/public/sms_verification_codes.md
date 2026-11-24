# public.sms_verification_codes

> Códigos temporários de verificação por SMS associados a usuários.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 8 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do registro de verificação. |
| 2 | `user_id` | `uuid` | não |  |  | Usuário do Supabase Auth associado à verificação. |
| 3 | `phone_number` | `text` | não |  |  | Número de telefone destinatário do código. |
| 4 | `code` | `text` | não |  |  | Código temporário de verificação; dado sensível que não deve ser exposto a clientes. |
| 5 | `expires_at` | `timestamp with time zone` | não |  |  | Data e hora após a qual o código deixa de ser válido. |
| 6 | `used_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o código foi utilizado; nulo indica que não há uso registrado. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do código. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sms_verification_codes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sms_verification_codes_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sms_codes_user | btree | user_id, expires_at | não | sim |  | `CREATE INDEX idx_sms_codes_user ON public.sms_verification_codes USING btree (user_id, expires_at)` |
| sms_verification_codes_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sms_verification_codes_pkey ON public.sms_verification_codes USING btree (id)` |


## Policies (RLS)

### `Deny anon delete on sms_verification_codes`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | anon |
| USING | `false` |
| WITH CHECK |  |

### `Deny anon insert on sms_verification_codes`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | anon |
| USING |  |
| WITH CHECK | `false` |

### `Deny anon select on sms_verification_codes`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | anon |
| USING | `false` |
| WITH CHECK |  |

### `Deny anon update on sms_verification_codes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | anon |
| USING | `false` |
| WITH CHECK |  |

### `Deny authenticated update on sms_verification_codes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `false` |
| WITH CHECK |  |

### `Deny delete on sms_verification_codes`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `false` |
| WITH CHECK |  |

### `Deny direct INSERT - use RPCs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `false` |

### `Deny direct SELECT - use RPCs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `false` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
