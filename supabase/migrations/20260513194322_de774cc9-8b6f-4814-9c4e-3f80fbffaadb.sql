-- Atualizar a função de risco para usar a tabela buying_committee_members existente
CREATE OR REPLACE FUNCTION public.calculate_deal_risk_score(p_sale_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sale RECORD;
  v_risk_score INTEGER := 0;
  v_signals JSONB := '[]'::jsonb;
  v_committee_count INTEGER;
  v_has_decision_maker BOOLEAN;
  v_last_activity_days INTEGER;
  v_positive_signals INTEGER := 0;
BEGIN
  SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id;
  
  -- 1. Single-threaded risk (usando a tabela correta)
  SELECT count(*) INTO v_committee_count FROM public.buying_committee_members WHERE sale_id = p_sale_id;
  IF v_committee_count <= 1 THEN
    v_risk_score := v_risk_score + 30;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Single-threaded: Apenas um contato mapeado no comitê.', 'impact', 30);
  ELSIF v_committee_count >= 3 THEN
    v_positive_signals := v_positive_signals + 1;
    v_signals := v_signals || jsonb_build_object('type', 'opportunity', 'message', 'Multi-threaded: ' || v_committee_count || ' contatos engajados.', 'impact', -10);
  END IF;

  -- 2. No Decision Maker risk
  SELECT EXISTS(SELECT 1 FROM public.buying_committee_members WHERE sale_id = p_sale_id AND committee_role = 'decision_maker') INTO v_has_decision_maker;
  IF NOT v_has_decision_maker THEN
    v_risk_score := v_risk_score + 25;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Falta Decisor: Nenhum tomador de decisão identificado no comitê.', 'impact', 25);
  ELSE
    v_positive_signals := v_positive_signals + 1;
    v_signals := v_signals || jsonb_build_object('type', 'opportunity', 'message', 'Tomador de decisão identificado e mapeado.', 'impact', -15);
  END IF;

  -- 3. Stagnation risk
  v_last_activity_days := EXTRACT(DAY FROM (now() - v_sale.updated_at))::INTEGER;
  IF v_last_activity_days > 10 THEN
    v_risk_score := v_risk_score + 20;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Estagnação: Sem atualizações há ' || v_last_activity_days || ' dias.', 'impact', 20);
  ELSIF v_last_activity_days < 3 THEN
    v_positive_signals := v_positive_signals + 1;
    v_signals := v_signals || jsonb_build_object('type', 'opportunity', 'message', 'Alta Cadência: Atividade recente detectada.', 'impact', -5);
  END IF;

  -- 4. Deal Size Variance (Outlier detection)
  -- Se o deal for 3x maior que o ticket médio do vendedor, aumenta o risco
  -- Lógica simplificada:
  IF v_sale.amount > 50000 THEN
    v_risk_score := v_risk_score + 15;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'High Ticket: Deal acima do desvio padrão requer atenção extra.', 'impact', 15);
  END IF;

  RETURN jsonb_build_object(
    'score', GREATEST(0, LEAST(100, v_risk_score)),
    'signals', v_signals,
    'level', CASE 
      WHEN v_risk_score < 30 THEN 'low'
      WHEN v_risk_score < 60 THEN 'medium'
      ELSE 'high'
    END,
    'positive_indicators', v_positive_signals,
    'updated_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
