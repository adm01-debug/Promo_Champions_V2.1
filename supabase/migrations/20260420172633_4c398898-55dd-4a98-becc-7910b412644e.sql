
DO $$
DECLARE
  v_joaquim uuid := 'd6e1428a-7077-4c62-ac03-64dae3d3e32a';
  v_teste_qa uuid := '8d81f2e3-5228-4ae5-8ba6-db8f81f505a7';
  v_admin uuid := '7a303940-ee7f-4c88-9332-be738612f72b';
  v_closer uuid := 'c336ff0b-47e1-49f5-8349-4759c2e11405';
  v_s1 uuid := 'ea88d50f-8308-447e-813e-8c24738731b8';
  v_s2 uuid := 'a8f3a185-0812-4289-9576-4f665f7b084b';
  v_s3 uuid := '884f6a28-b125-43ee-acc9-4d6d5ea8579f';
  r record;
BEGIN
  FOR r IN
    SELECT pc.id AS pc_id, q.quote_number, q.sent_at
    FROM prospect_cadences pc
    JOIN quotes q ON q.id = pc.quote_id
    WHERE q.quote_number LIKE 'MOCK-CAD-%'
  LOOP
    CASE r.quote_number
      WHEN 'MOCK-CAD-0001' THEN UPDATE prospect_cadences SET salesperson_id=v_joaquim, status='active', current_step=1, next_action_date=CURRENT_DATE, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0002' THEN UPDATE prospect_cadences SET salesperson_id=v_teste_qa, status='active', current_step=2, next_action_date=CURRENT_DATE+2, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0003' THEN UPDATE prospect_cadences SET salesperson_id=v_admin, status='active', current_step=2, next_action_date=CURRENT_DATE+1, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0004' THEN UPDATE prospect_cadences SET salesperson_id=v_closer, status='active', current_step=3, next_action_date=CURRENT_DATE+3, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0005' THEN UPDATE prospect_cadences SET salesperson_id=v_joaquim, status='active', current_step=3, next_action_date=CURRENT_DATE, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0006' THEN UPDATE prospect_cadences SET salesperson_id=v_joaquim, status='active', current_step=4, next_action_date=CURRENT_DATE, started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0007' THEN UPDATE prospect_cadences SET salesperson_id=v_admin, status='completed', current_step=5, next_action_date=NULL, completed_at=now()-interval '23 days', started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0008' THEN UPDATE prospect_cadences SET salesperson_id=v_joaquim, status='completed', current_step=5, next_action_date=NULL, completed_at=now()-interval '12 days', started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0009' THEN UPDATE prospect_cadences SET salesperson_id=v_closer, status='completed', current_step=5, next_action_date=NULL, completed_at=now()-interval '4 days', started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0010' THEN UPDATE prospect_cadences SET salesperson_id=v_teste_qa, status='paused', current_step=2, next_action_date=NULL, paused_at=now()-interval '10 days', paused_reason='Aguardando retorno do cliente', started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0011' THEN UPDATE prospect_cadences SET salesperson_id=v_admin, status='paused', current_step=3, next_action_date=NULL, paused_at=now()-interval '7 days', paused_reason='Cliente em viagem', started_at=r.sent_at WHERE id=r.pc_id;
      WHEN 'MOCK-CAD-0012' THEN UPDATE prospect_cadences SET salesperson_id=v_joaquim, status='cancelled', current_step=2, next_action_date=NULL, completed_at=now()-interval '20 days', started_at=r.sent_at WHERE id=r.pc_id;
      ELSE NULL;
    END CASE;
  END LOOP;

  UPDATE quotes SET status='approved', approved_at=now()-interval '23 days', updated_at=now()-interval '23 days' WHERE quote_number='MOCK-CAD-0007';
  UPDATE quotes SET status='approved', approved_at=now()-interval '12 days', updated_at=now()-interval '12 days' WHERE quote_number='MOCK-CAD-0008';
  UPDATE quotes SET status='approved', approved_at=now()-interval '4 days',  updated_at=now()-interval '4 days'  WHERE quote_number='MOCK-CAD-0009';
  UPDATE quotes SET status='rejected', rejected_at=now()-interval '20 days', updated_at=now()-interval '20 days' WHERE quote_number='MOCK-CAD-0012';

  -- 8 tarefas concluídas hoje
  UPDATE cadence_tasks SET status='completed', completed_at=now()-interval '2 hours'
  WHERE id IN (
    SELECT ct.id FROM cadence_tasks ct
    JOIN prospect_cadences pc ON pc.id=ct.prospect_cadence_id
    JOIN quotes q ON q.id=pc.quote_id
    WHERE q.quote_number IN ('MOCK-CAD-0002','MOCK-CAD-0003','MOCK-CAD-0007','MOCK-CAD-0008','MOCK-CAD-0009')
      AND ct.status='pending'
    LIMIT 8
  );

  -- Tarefas concluídas históricas
  INSERT INTO cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date, status, completed_at)
  SELECT pc.id, v_s1, (CURRENT_DATE - 25)::date, 'completed', now() - interval '25 days'
  FROM prospect_cadences pc JOIN quotes q ON q.id=pc.quote_id
  WHERE q.quote_number IN ('MOCK-CAD-0007','MOCK-CAD-0008','MOCK-CAD-0011');

  INSERT INTO cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date, status, completed_at)
  SELECT pc.id, v_s2, (CURRENT_DATE - 18)::date, 'completed', now() - interval '18 days'
  FROM prospect_cadences pc JOIN quotes q ON q.id=pc.quote_id
  WHERE q.quote_number IN ('MOCK-CAD-0004','MOCK-CAD-0007','MOCK-CAD-0008','MOCK-CAD-0009','MOCK-CAD-0011');

  INSERT INTO cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date, status, completed_at)
  SELECT pc.id, v_s3, (CURRENT_DATE - 10)::date, 'completed', now() - interval '10 days'
  FROM prospect_cadences pc JOIN quotes q ON q.id=pc.quote_id
  WHERE q.quote_number IN ('MOCK-CAD-0004','MOCK-CAD-0008','MOCK-CAD-0009');

  -- 3 pendentes hoje p/ JOAQUIM
  INSERT INTO cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date, status)
  SELECT pc.id, v_s1, CURRENT_DATE, 'pending'
  FROM prospect_cadences pc JOIN quotes q ON q.id=pc.quote_id
  WHERE q.quote_number IN ('MOCK-CAD-0001','MOCK-CAD-0005','MOCK-CAD-0006')
    AND NOT EXISTS (
      SELECT 1 FROM cadence_tasks ct2
      WHERE ct2.prospect_cadence_id=pc.id AND ct2.scheduled_date=CURRENT_DATE AND ct2.status='pending'
    );
END $$;
