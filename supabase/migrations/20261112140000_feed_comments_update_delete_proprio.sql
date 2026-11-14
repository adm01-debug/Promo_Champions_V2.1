-- feed_comments: autor pode editar e apagar o próprio comentário.
--
-- Causa: a tabela só tinha policies SELECT ("Authenticated can read
-- feed_comments") e INSERT ("Users can insert own feed_comments"). Sem policy
-- de UPDATE/DELETE, o RLS bloqueava qualquer edição ou exclusão — o feed de
-- vitórias não permitia corrigir nem remover um comentário.
--
-- Efeito: usuário autenticado passa a poder UPDATE/DELETE apenas nas linhas
-- em que salesperson_id é o vendedor dele (mesmo helper da policy INSERT,
-- envolvido em SELECT para avaliação única por statement). No UPDATE, o
-- WITH CHECK impede transferir o comentário para outro vendedor.

DROP POLICY IF EXISTS "Users can update own feed_comments" ON public.feed_comments;
CREATE POLICY "Users can update own feed_comments"
  ON public.feed_comments FOR UPDATE TO authenticated
  USING (salesperson_id = (SELECT public.get_current_salesperson_id()))
  WITH CHECK (salesperson_id = (SELECT public.get_current_salesperson_id()));

DROP POLICY IF EXISTS "Users can delete own feed_comments" ON public.feed_comments;
CREATE POLICY "Users can delete own feed_comments"
  ON public.feed_comments FOR DELETE TO authenticated
  USING (salesperson_id = (SELECT public.get_current_salesperson_id()));
