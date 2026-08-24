-- Tabela para filtros salvos
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_filter_name_per_user UNIQUE (user_id, entity_type, name)
);

ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own filters" ON saved_filters 
FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_saved_filters_user ON saved_filters(user_id, entity_type);
