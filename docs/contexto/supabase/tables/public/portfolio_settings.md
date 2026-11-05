# public.portfolio_settings

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `setting_key` | `text` | não |  |  |  |
| 3 | `setting_value` | `text` | não |  |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| portfolio_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| portfolio_settings_setting_key_key | UNIQUE | `UNIQUE (setting_key)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| portfolio_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX portfolio_settings_pkey ON public.portfolio_settings USING btree (id)` |
| portfolio_settings_setting_key_key | btree | setting_key | sim | sim |  | `CREATE UNIQUE INDEX portfolio_settings_setting_key_key ON public.portfolio_settings USING btree (setting_key)` |


## Policies (RLS)

### `Admins can manage portfolio_settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admins can read all portfolio settings including credentials`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Authenticated can view portfolio settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Authenticated users can read non-sensitive portfolio settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((setting_key !~~* '%token%'::text) AND (setting_key !~~* '%secret%'::text) AND (setting_key !~~* '%webhook%'::text) AND (setting_key !~~* '%api_key%'::text) AND (setting_key !~~* '%password%'::text) AND (setting_key !~~* '%credential%'::text) AND (setting_key !~~* '%private%'::text))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_portfolio_settings_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
