import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLeadScoring } from '@/hooks/useLeadScoring';

import { LeadNeuralDossier } from './LeadNeuralDossier';
import { LeadScoreDistribution } from './LeadScoreDistribution';
import { LeadScoringHeader } from './LeadScoringHeader';
import { LeadScoringKpis } from './LeadScoringKpis';
import { LeadScoringSkeleton } from './LeadScoringSkeleton';
import { LeadChurnAlertsPanel } from './LeadChurnAlertsPanel';
import { LeadRankingCard } from './LeadRankingCard';
import type { LeadConnectionStatus } from './scoring-ui';
import { useExplainBatch } from '@/hooks/scoring/useExplainBatch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getLocalISODate } from '@/utils/dateHelpers';
import { sanitizeCsvCell } from '@/utils/csvExport';

export function LeadScoringDashboard() {
  const { data: leads, isLoading, refetch } = useLeadScoring();
  const [_explainSaleId, _setExplainSaleId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [churnFilter, setChurnFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [attendedAlerts, setAttendedAlerts] = useState<Set<string>>(new Set());
  const explainBatch = useExplainBatch();

  useEffect(() => {
    const channel = supabase
      .channel('lead-scoring-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lead_score_trends' },
        () => {
          setIsLoadingLeads(true);
          refetch().finally(() => setIsLoadingLeads(false));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lead_churn_risk' },
        () => {
          setIsLoadingLeads(true);
          refetch().finally(() => setIsLoadingLeads(false));
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected');
        else if (status === 'CLOSED') setConnectionStatus('connecting');
        else if (status === 'CHANNEL_ERROR') setConnectionStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  const allLeads = leads || [];

  const filteredLeads = useMemo(() => {
    return allLeads.filter(l => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [allLeads, searchTerm]);

  const alerts = useMemo(() => {
    return allLeads
      .filter(
        l =>
          l.churnRisk &&
          l.churnRisk.risk_score > 50 &&
          !attendedAlerts.has(l.id) &&
          (churnFilter === 'all' || l.churnRisk.risk_level === churnFilter)
      )
      .sort((a, b) => (b.churnRisk?.risk_score || 0) - (a.churnRisk?.risk_score || 0));
  }, [allLeads, attendedAlerts, churnFilter]);

  const [connectionStatus, setConnectionStatus] =
    useState<LeadConnectionStatus>('connecting');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const hotCount = allLeads.filter(l => l.category === 'Hot').length;
  const warmCount = allLeads.filter(l => l.category === 'Warm').length;
  const coldCount = allLeads.filter(l => l.category === 'Cold').length;
  const avgScore =
    allLeads.length > 0
      ? Math.round(allLeads.reduce((s, l) => s + l.score, 0) / allLeads.length)
      : 0;

  const exportToCSV = useCallback(() => {
    setIsExporting(true);
    try {
      const rankingHeaders = [
        'Rank',
        'Name',
        'Company',
        'Email',
        'Score',
        'Category',
        'Risk Level',
        'Risk Score',
        'Factors',
      ];
      const csvCell = (v: string | number) =>
        typeof v === 'number'
          ? String(v)
          : `"${sanitizeCsvCell(String(v)).replace(/"/g, '""')}"`;

      const rankingRows = filteredLeads.map((l, i) => [
        i + 1,
        csvCell(l.name),
        csvCell(l.company || 'N/A'),
        csvCell(l.email),
        l.score,
        csvCell(l.category),
        csvCell(l.churnRisk?.risk_level || 'low'),
        l.churnRisk?.risk_score || 0,
        csvCell(l.churnRisk?.factors.join('; ') || ''),
      ]);

      const distSummary = [
        [],
        ['HISTOGRAM DISTRIBUTION SUMMARY'],
        ['Range', 'Count'],
        ['81-100 (Hot)', hotCount],
        ['51-80 (Warm)', warmCount],
        ['0-50 (Cold)', coldCount],
      ];

      const csvContent = [
        ['STRATEGIC LEAD RANKING REPORT'],
        [`Generated on: ${new Date().toLocaleString()}`],
        [],
        rankingHeaders,
        ...rankingRows,
        ...distSummary,
      ]
        .map(e => e.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lead_intelligence_report_${getLocalISODate()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Relatório estratégico e histograma exportados!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar relatório CSV.');
    } finally {
      setIsExporting(false);
    }
  }, [filteredLeads, hotCount, warmCount, coldCount]);

  const exportToPDF = useCallback(() => {
    setIsExporting(true);
    toast.info('Otimizando layout para exportação PDF...');
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 800);
  }, []);

  const handleNeuralAnalysis = useCallback(async () => {
    const ids = allLeads.map(l => l.bestDealId).filter(Boolean) as string[];
    if (ids.length > 0) {
      await explainBatch.mutateAsync(ids.slice(0, 50));
      await supabase
        .from('lead_score_trends')
        .insert(allLeads.map(l => ({ sale_id: l.bestDealId || l.id, score: l.score })));
    }
  }, [allLeads, explainBatch]);

  const handleAttendAlert = useCallback((leadId: string) => {
    setAttendedAlerts(prev => new Set([...prev, leadId]));
  }, []);

  const selectedLead = useMemo(() => {
    return allLeads.find(l => l.id === selectedLeadId) || null;
  }, [allLeads, selectedLeadId]);

  if (isLoading) {
    return <LeadScoringSkeleton />;
  }

  return (
    <div className="space-y-8 p-1 sm:p-0 relative">
      <LeadNeuralDossier
        lead={selectedLead}
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
      {/* Real-time Global Sync Loading State */}
      {(isLoadingLeads || explainBatch.isPending) && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] overflow-hidden bg-primary/5">
          <div className="h-full bg-primary animate-progress shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
        </div>
      )}

      <LeadScoringHeader
        totalLeads={allLeads.length}
        connectionStatus={connectionStatus}
        isAnalyzing={explainBatch.isPending}
        isExporting={isExporting}
        onNeuralAnalysis={() => void handleNeuralAnalysis()}
        onExportPDF={exportToPDF}
      />

      <LeadScoringKpis
        avgScore={avgScore}
        hotCount={hotCount}
        warmCount={warmCount}
        coldCount={coldCount}
      />

      {/* Analytics & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LeadScoreDistribution />
        </div>

        <LeadChurnAlertsPanel
          alerts={alerts}
          churnFilter={churnFilter}
          onChurnFilterChange={setChurnFilter}
          onAttendAlert={handleAttendAlert}
          onSelectLead={setSelectedLeadId}
          hasLeads={allLeads.length > 0}
          hotCount={hotCount}
        />
      </div>

      <LeadRankingCard
        leads={filteredLeads}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExportCSV={exportToCSV}
        onExportPDF={exportToPDF}
        isExporting={isExporting}
        isSyncing={explainBatch.isPending || isLoadingLeads || isLoading}
        connectionStatus={connectionStatus}
        onSelectLead={setSelectedLeadId}
      />

      {/* Diálogos Legados Removidos - Usando LeadNeuralDossier */}
    </div>
  );
}

export default LeadScoringDashboard;
