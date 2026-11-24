# public.follow_up_settings

> Tabela public.follow_up_settings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), cadence_days integer[] NULLABLE DEFAULT '{3,5,15}'::integer[], whatsapp_template text NULLABLE DEFAULT 'Olá {{client_name}}! Sou o seu consultor na PROMO CHAMPIONS. Notei que nossa negociação sobre o {{product_name}} está na etapa de {{status}} e faz uns dias que não nos falamos. Como posso te ajudar a avançar hoje?'::text, auto_reactivate_class_a boolean NULLABLE DEFAULT false, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(), current_whatsapp_version_id uuid NULLABLE. Relacionamentos FK: current_whatsapp_version_id → public.whatsapp_template_versions(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.follow_up_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `cadence_days` | `integer[]` | sim | `'{3,5,15}'::integer[]` |  | Coluna cadence_days da tabela public.follow_up_settings. Tipo PostgreSQL: integer[]. Aceita NULL. Valor padrão: '{3,5,15}'::integer[]. |
| 3 | `whatsapp_template` | `text` | sim | `'Olá {{client_name}}! Sou o seu consultor na PROMO CHAMPIONS. Notei que nossa negociação sobre o {{product_name}} está na etapa de {{status}} e faz uns dias que não nos falamos. Como posso te ajudar a avançar hoje?'::text` |  | Coluna whatsapp_template da tabela public.follow_up_settings. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'Olá {{client_name}}! Sou o seu consultor na PROMO CHAMPIONS. Notei que nossa negociação sobre o {{product_name}} está na etapa de {{status}} e faz uns dias que não nos falamos. Como posso te ajudar a avançar hoje?'::text. |
| 4 | `auto_reactivate_class_a` | `boolean` | sim | `false` |  | Coluna auto_reactivate_class_a da tabela public.follow_up_settings. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 5 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.follow_up_settings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 6 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.follow_up_settings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 7 | `current_whatsapp_version_id` | `uuid` | sim |  |  | Coluna current_whatsapp_version_id da tabela public.follow_up_settings. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.whatsapp_template_versions(id). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_settings_current_whatsapp_version_id_fkey | FOREIGN KEY | `FOREIGN KEY (current_whatsapp_version_id) REFERENCES whatsapp_template_versions(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_settings_pkey ON public.follow_up_settings USING btree (id)` |
| idx_follow_up_settings_current_whatsapp_version_id | btree | current_whatsapp_version_id | não | sim |  | `CREATE INDEX idx_follow_up_settings_current_whatsapp_version_id ON public.follow_up_settings USING btree (current_whatsapp_version_id)` |


## Policies (RLS)

### `Admins can update follow_up_settings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |
| WITH CHECK |  |

### `Authenticated users can read follow_up_settings`

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
| tr_template_versioning | BEFORE | UPDATE | ROW | enabled | private.handle_template_versioning |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
