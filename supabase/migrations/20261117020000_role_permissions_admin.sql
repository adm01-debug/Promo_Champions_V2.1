-- Cadastra no papel admin as permissoes que ele ja exerce de fato.
--
-- Estado encontrado em producao:
--   role_permissions: manager = 10 regras (todas as permissoes cadastradas),
--                     salesperson = 6, admin = 0.
--   public.permissions tem exatamente 10 linhas.
--   user_roles: 5 usuarios admin, 6 salesperson.
--
-- Consequencia: get_user_permissions() devolve apenas o que esta em
-- role_permissions, e nao existe permissao '*' na tabela. Logo, para os 5
-- admins, usePermissions().canAccess(...) e hasPermission(...) retornam FALSE
-- para tudo. Qualquer tela que passe a gatear por canAccess esconderia o
-- controle justamente de quem tem mais acesso -- e por isso que o repo gateia
-- por isAdmin/isManager (que vem de user_roles direto) e nunca por canAccess,
-- e por isso que src/components/auth/PermissionGate.tsx nunca pode ser ligado.
--
-- Isto NAO concede acesso novo: o admin ja passa em has_role(auth.uid(),
-- 'admin') e em is_admin_or_manager() em todas as policies, inclusive nas de
-- role_permissions e permissions. A tabela role_permissions hoje nao gateia
-- nada no app (nenhum consumidor de canAccess em producao). O que esta
-- migration faz e tornar o dado consistente com o acesso que ja vale,
-- espelhando exatamente as 10 regras que o manager ja tem.
--
-- Idempotente: ON CONFLICT na UNIQUE (role, permission_id). Rodar de novo nao
-- duplica nada, e permissao nova cadastrada depois NAO entra automaticamente --
-- a tela Configuracoes > Matriz de Permissoes
-- (src/components/settings/PermissionMatrix.tsx, montada em
-- src/pages/Configuracoes.tsx:305) continua sendo o lugar de ajustar, e ela
-- funciona: a policy "Admins can manage role_permissions" (ALL, has_role
-- admin) permite escrita.

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, p.id
FROM public.permissions p
ON CONFLICT (role, permission_id) DO NOTHING;
