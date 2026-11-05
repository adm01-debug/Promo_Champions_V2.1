-- Adiciona coluna task_type para melhor categorização
ALTER TABLE public.cadence_tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'manual';

-- Atualiza tipos existentes baseado no step da cadência se possível (via trigger ou manual)
-- Por enquanto, garantimos que a coluna existe para o front-end utilizar.
