import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";

/**
 * Fire-and-forget indexer. Failures are logged but never propagate.
 */
export function useIndexEntity() {
  const index = useCallback((entity_type: SemanticEntityType, entity_id: string) => {
    void supabase.functions
      .invoke("semantic-index-entity", { body: { entity_type, entity_id } })
      .catch((err) => {
        // Silent: indexing is best-effort
        console.warn("[semantic-index] failed", err);
      });
  }, []);
  return { index };
}
