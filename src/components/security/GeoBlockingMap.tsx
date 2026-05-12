import React from 'react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Simplified SVG paths for major regions (for visualization)
const MAP_PATHS = [
  { id: 'BR', name: 'Brasil', d: 'M150,150 L180,150 L180,200 L150,200 Z' }, // Mock paths, in reality would be full world SVG
  { id: 'US', name: 'Estados Unidos', d: 'M100,80 L140,80 L140,110 L100,110 Z' },
  { id: 'CN', name: 'China', d: 'M250,100 L280,100 L280,130 L250,130 Z' },
  { id: 'RU', name: 'Rússia', d: 'M220,50 L280,50 L280,80 L220,80 Z' },
  // ... more countries could be added here
];

export const GeoBlockingMap = () => {
  const queryClient = useQueryClient();

  const { data: blockedRegions, isLoading } = useQuery({
    queryKey: ['geo-blocked-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_blocked_regions')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    }
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ countryCode, countryName, isBlocked }: { countryCode: string, countryName: string, isBlocked: boolean }) => {
      if (isBlocked) {
        // Unblock
        const { error } = await supabase
          .from('geo_blocked_regions')
          .update({ is_active: false })
          .eq('country_code', countryCode);
        if (error) throw error;
      } else {
        // Block
        const { error } = await supabase
          .from('geo_blocked_regions')
          .upsert({ 
            country_code: countryCode, 
            country_name: countryName, 
            is_active: true,
            reason: 'Manual block from Security Dashboard'
          }, { onConflict: 'country_code' });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['geo-blocked-regions'] });
      toast.success(`${variables.countryName} ${variables.isBlocked ? 'desbloqueado' : 'bloqueado'} com sucesso`);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const isCountryBlocked = (code: string) => {
    return blockedRegions?.some(r => r.country_code === code);
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-black/20 rounded-xl border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regiões Seguras</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regiões Bloqueadas</span>
        </div>
      </div>

      <svg viewBox="0 0 400 250" className="w-full h-full p-8 drop-shadow-2xl">
        {MAP_PATHS.map((country) => {
          const blocked = isCountryBlocked(country.id);
          return (
            <path
              key={country.id}
              d={country.d}
              className={cn(
                "transition-all duration-500 cursor-pointer stroke-white/10 stroke-[0.5]",
                blocked 
                  ? "fill-destructive/40 hover:fill-destructive/60 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  : "fill-white/5 hover:fill-primary/20"
              )}
              onClick={() => toggleBlockMutation.mutate({ 
                countryCode: country.id, 
                countryName: country.name, 
                isBlocked: !!blocked 
              })}
            >
              <title>{country.name} {blocked ? '(Bloqueado)' : '(Liberado)'}</title>
            </path>
          );
        })}
        {/* Placeholder for more countries - simple circles for visual weight */}
        <circle cx="80" cy="180" r="10" className="fill-white/5 stroke-white/5 hover:fill-primary/20 cursor-pointer" />
        <circle cx="320" cy="160" r="15" className="fill-white/5 stroke-white/5 hover:fill-primary/20 cursor-pointer" />
        <circle cx="200" cy="100" r="12" className="fill-white/5 stroke-white/5 hover:fill-primary/20 cursor-pointer" />
      </svg>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
         <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Interactive Geo-Shield V2.0</span>
      </div>
    </div>
  );
};
