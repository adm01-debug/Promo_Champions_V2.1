-- Adicionar novos valores ao enum de resultados de atividade
-- Primeiro verificamos se o tipo existe. No Supabase/PostgREST, enums costumam ser text com check constraints ou tipos específicos.
-- Com base no erro do TS, parece que o tipo gerado no banco ainda não conhece os novos valores.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_outcome') THEN
        ALTER TYPE activity_outcome ADD VALUE IF NOT EXISTS 'bad_timing';
        ALTER TYPE activity_outcome ADD VALUE IF NOT EXISTS 'wrong_person';
        ALTER TYPE activity_outcome ADD VALUE IF NOT EXISTS 'unsubscribed';
    END IF;
END
$$;
