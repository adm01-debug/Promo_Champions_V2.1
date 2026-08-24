import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClientSelector } from '@/components/bi/ClientSelector';
import { ClientOverview360 } from '@/components/bi/ClientOverview360';
import { ClientVsIndustryComparison } from '@/components/bi/ClientVsIndustryComparison';
import { ClientAffinityProducts } from '@/components/bi/ClientAffinityProducts';
import { IndustryTrendingProducts } from '@/components/bi/IndustryTrendingProducts';
import { ClientSeasonalityHeatmap } from '@/components/bi/ClientSeasonalityHeatmap';
import { EmpiricalRecommendations } from '@/components/bi/EmpiricalRecommendations';
import { useClientBI } from '@/hooks/bi/useClientBI';
import { useClientVsIndustry } from '@/hooks/bi/useClientVsIndustry';
import { useIndustryTrends, useClientSeasonality } from '@/hooks/bi/useIndustryTrends';
import { useBIDossierExport } from '@/hooks/bi/useBIDossierExport';
import { ExportDossierButton } from '@/components/bi/ExportDossierButton';
import { toast } from 'sonner';

export default function BusinessIntelligencePage() {
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    ramo_atividade: string | null;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: clientBI, isLoading: _loadingBI } = useClientBI(
    selectedClient?.id,
    selectedClient?.ramo_atividade || undefined
  );
  const { data: comparison, isLoading: _loadingComparison } = useClientVsIndustry(
    selectedClient?.id,
    selectedClient?.ramo_atividade || undefined
  );
  const { data: trends, isLoading: _loadingTrends } = useIndustryTrends(
    selectedClient?.id,
    selectedClient?.ramo_atividade || undefined
  );
  const { data: seasonality, isLoading: _loadingSeasonality } = useClientSeasonality(
    selectedClient?.id,
    selectedClient?.ramo_atividade || undefined
  );
  const { exportToPDF } = useBIDossierExport();

  const handleExport = async () => {
    if (!selectedClient || !clientBI || !comparison || !trends || !seasonality) {
      toast.error('Aguarde o carregamento completo dos dados para exportar.');
      return;
    }

    setIsExporting(true);
    toast.info('Gerando Dossiê PDF...', {
      description: 'Isso pode levar alguns segundos.',
    });

    try {
      await exportToPDF(
        selectedClient.name,
        selectedClient.ramo_atividade || 'Geral',
        clientBI,
        comparison,
        trends,
        seasonality
      );
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Business Intelligence | Promo Champions</title>
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title uppercase italic">
                  Business <span className="text-primary">Intelligence</span>
                </h1>
                <p className="text-sm text-muted-foreground/80 font-medium">
                  Análise avançada 360°, benchmarking e insights preditivos.
                </p>
              </div>
            </motion.div>

            {selectedClient && (
              <ExportDossierButton onClick={handleExport} isLoading={isExporting} />
            )}
          </div>

          <div className="max-w-2xl">
            <ClientSelector
              selectedId={selectedClient?.id}
              onSelect={setSelectedClient}
            />
          </div>

          {selectedClient ? (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  {clientBI && (
                    <ClientOverview360 data={clientBI.customer360} />
                  )}
                </div>
                <div className="lg:col-span-4">
                  {clientBI && <EmpiricalRecommendations data={clientBI.expertCurated} />}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {comparison && <ClientVsIndustryComparison data={comparison} />}
                {clientBI && <ClientAffinityProducts data={clientBI.affinity} />}
                {trends && <IndustryTrendingProducts data={trends} />}
              </div>

              {seasonality && <ClientSeasonalityHeatmap data={seasonality} />}

              <div className="flex justify-center py-8 border-t border-white/5 opacity-50">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                  <Brain className="size-3" /> Confidencial · Uso Interno Comercial
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
              <div className="p-6 rounded-full bg-white/5">
                <Sparkles className="size-12 text-primary" />
              </div>
              <div className="max-w-xs">
                <p className="text-lg font-black uppercase italic tracking-tight">
                  Aguardando Seleção
                </p>
                <p className="text-xs font-medium">
                  Selecione um cliente acima para gerar a análise de inteligência
                  completa.
                </p>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
}
