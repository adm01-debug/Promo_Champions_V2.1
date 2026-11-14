-- Batalha de vendas: admin/gestor passa a poder inscrever participantes.
--
-- Causa: criar batalha (useSalesBattles.createBattle) grava sales_battles e
-- depois insere >= 2 linhas em battle_participants, uma por vendedor
-- escolhido. sales_battles só aceita admin/gestor ("Admins can manage
-- battles"), mas a única policy de INSERT em battle_participants era
-- "Users can join battles as self" (salesperson_id =
-- get_current_salesperson_id()). Como há pelo menos 2 vendedores distintos,
-- ao menos uma linha não é do próprio usuário e o insert inteiro era recusado
-- pela RLS: nenhuma batalha conseguia ser criada.
--
-- Correção: policy PERMISSIVE de INSERT para admin/gestor, no mesmo critério
-- já usado para criar a batalha e atualizar participantes. A policy de
-- auto-inscrição continua valendo para o vendedor comum, que segue sem poder
-- inscrever outra pessoa.

DROP POLICY IF EXISTS "Admins can add battle participants" ON public.battle_participants;

CREATE POLICY "Admins can add battle participants"
  ON public.battle_participants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
