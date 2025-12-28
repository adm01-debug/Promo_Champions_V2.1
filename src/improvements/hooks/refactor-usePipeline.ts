/**
 * REFATORAÇÃO 1/5: usePipeline.ts
 * Remove 1 ocorrência de `any` - DragEndEvent
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ✅ ANTES: DragEndEvent usava `any`
// ❌ const handleDragEnd = (event: any) => { ... }

// ✅ DEPOIS: Interface tipada
interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        deal?: Deal;
        stageId?: string;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        stageId?: string;
      };
    };
  } | null;
  delta: {
    x: number;
    y: number;
  };
  activatorEvent: MouseEvent | TouchEvent | KeyboardEvent;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  client_id: string;
  assigned_to: string;
  status: 'open' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  probability: number;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
}

interface Stage {
  id: string;
  name: string;
  order_index: number;
  pipeline_id: string;
}

interface PipelineData {
  stages: Stage[];
  deals: Record<string, Deal[]>;
}

export const usePipeline = (pipelineId?: string) => {
  return useQuery<PipelineData>({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      // Buscar estágios
      const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', pipelineId || 'default')
        .order('order_index', { ascending: true });

      if (stagesError) throw stagesError;

      // Buscar deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .in('stage_id', stages.map(s => s.id))
        .is('deleted_at', null);

      if (dealsError) throw dealsError;

      // Organizar deals por estágio
      const dealsByStage: Record<string, Deal[]> = {};
      stages.forEach(stage => {
        dealsByStage[stage.id] = deals.filter(d => d.stage_id === stage.id);
      });

      return {
        stages,
        deals: dealsByStage,
      };
    },
  });
};

// ✅ Handler tipado corretamente
export function handleDragEnd(event: DragEndEvent, onUpdate: (dealId: string, newStageId: string) => void) {
  const { active, over } = event;

  if (!over) return;

  const dealId = active.id as string;
  const newStageId = over.data.current?.stageId;

  if (newStageId && dealId) {
    onUpdate(dealId, newStageId);
  }
}
