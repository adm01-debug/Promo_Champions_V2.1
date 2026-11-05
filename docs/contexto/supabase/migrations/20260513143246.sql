CREATE OR REPLACE FUNCTION public.merge_clients(target_id UUID, duplicate_ids UUID[], preferred_fields JSONB DEFAULT '{}'::JSONB)
RETURNS VOID AS $$
DECLARE
    dup_id UUID;
    field_key TEXT;
    field_value TEXT;
    merged_tags TEXT[];
BEGIN
    -- 1. Atualizar campos preferenciais se fornecidos
    IF preferred_fields <> '{}'::JSONB THEN
        FOR field_key, field_value IN SELECT * FROM jsonb_each_text(preferred_fields)
        LOOP
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = field_key) THEN
                EXECUTE format('UPDATE public.clients SET %I = %L WHERE id = %L', field_key, field_value, target_id);
            END IF;
        END LOOP;
    END IF;

    -- 2. Consolidar Tags (Merge de arrays removendo duplicatas)
    SELECT ARRAY_AGG(DISTINCT tag)
    INTO merged_tags
    FROM (
        SELECT UNNEST(tags) as tag FROM public.clients WHERE id = target_id OR id = ANY(duplicate_ids)
    ) t
    WHERE tag IS NOT NULL;

    UPDATE public.clients SET tags = merged_tags WHERE id = target_id;

    -- 3. Reatribuir registros relacionados de todas as tabelas conhecidas
    FOREACH dup_id IN ARRAY duplicate_ids
    LOOP
        -- Core CRM
        UPDATE public.sales SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.tasks SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.activities SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.notes SET client_id = target_id WHERE client_id = dup_id;
        
        -- Intelligence & Analytics
        UPDATE public.agenda_events SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.call_recordings SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.conversation_analyses SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.lead_detailed_logs SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.lead_routing_log SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_interactions SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.icp_data SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_portfolio SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_purchase_seasonality SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.lead_scenarios SET client_id = target_id WHERE client_id = dup_id;
        
        -- Logs de Auditoria
        UPDATE public.audit_logs SET record_id = target_id WHERE record_id = dup_id AND table_name = 'clients';

        -- Tabelas condicionais (Engajamento/Sequências)
        BEGIN
            EXECUTE 'UPDATE public.cadence_enrollments SET client_id = $1 WHERE client_id = $2' USING target_id, dup_id;
            EXECUTE 'UPDATE public.sequence_enrollments SET client_id = $1 WHERE client_id = $2' USING target_id, dup_id;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Deletar o registro duplicado
        DELETE FROM public.clients WHERE id = dup_id;
    END LOOP;

    -- 4. Recalcular total_value para o mestre (Soma de vendas ganhas)
    UPDATE public.clients 
    SET total_value = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.sales 
        WHERE client_id = target_id 
        AND (status = 'won' OR status = 'completed' OR deal_status::text IN ('won', 'completed'))
    )
    WHERE id = target_id;

END;
$$ LANGUAGE plpgsql;
