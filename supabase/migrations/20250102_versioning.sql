CREATE TABLE IF NOT EXISTS entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number)
);

CREATE INDEX idx_versions_entity ON entity_versions(entity_type, entity_id);
CREATE INDEX idx_versions_date ON entity_versions(changed_at DESC);

CREATE OR REPLACE FUNCTION create_version() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO entity_versions (entity_type, entity_id, version_number, data, changed_by, change_summary)
  SELECT TG_TABLE_NAME, NEW.id, COALESCE(MAX(version_number), 0) + 1, row_to_json(OLD), auth.uid(), 'Auto-save'
  FROM entity_versions WHERE entity_type = TG_TABLE_NAME AND entity_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
