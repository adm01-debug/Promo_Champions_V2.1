-- Aperta os grants das duas tabelas criadas em 20261117050000.
--
-- As duas nasceram com o grant default do Supabase para anon e authenticated:
--   anon          -> DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE
--   authenticated -> DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE
--
-- Hoje isso nao da acesso a linha nenhuma, porque as duas tem RLS ligada:
-- webhook_dispatch_rate nao tem policy (nega tudo fora de service_role) e
-- webhook_allowed_domains so tem a policy de admin. Mas grant largo em tabela
-- de estado interno e armadilha: no dia em que alguem desligar a RLS ou criar
-- uma policy permissiva, o acesso passa a existir de verdade. Defesa em
-- profundidade: tirar o que nao e usado.
--
-- webhook_dispatch_rate: contador interno do rate-limit, escrito so por
-- check_webhook_rate_limit (SECURITY DEFINER) e lido so por service_role.
-- Nenhum papel de cliente precisa de nada aqui.
--
-- webhook_allowed_domains: authenticated CONTINUA com SELECT/INSERT/UPDATE/
-- DELETE, senao a policy "Admins manage webhook_allowed_domains" (FOR ALL TO
-- authenticated) nao tem como ser exercida -- grant e policy sao filtros em
-- serie, nao alternativas. Saem o anon inteiro e os privilegios que ninguem
-- usa (TRIGGER, REFERENCES).
--
-- Conferido em producao antes de escrever: as duas tabelas existem, relrowsecurity
-- = true, webhook_dispatch_rate com 0 linhas e 0 policies, webhook_allowed_domains
-- com 1 policy.

REVOKE ALL ON TABLE public.webhook_dispatch_rate FROM anon, authenticated;

REVOKE ALL ON TABLE public.webhook_allowed_domains FROM anon;

REVOKE TRIGGER, REFERENCES ON TABLE public.webhook_allowed_domains FROM authenticated;
