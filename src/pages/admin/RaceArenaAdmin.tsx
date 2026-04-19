import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Flag } from 'lucide-react';
import { SeasonsManagerTable } from '@/components/race/admin/SeasonsManagerTable';
import { SeasonRulesPanel } from '@/components/race/admin/SeasonRulesPanel';
import { GarageAdminTable } from '@/components/race/admin/GarageAdminTable';
import { RaceAuditFeed } from '@/components/race/admin/RaceAuditFeed';
import { OverlayTelemetryPanel } from '@/components/race/admin/OverlayTelemetryPanel';
import { RaceBadgeShowcase } from '@/components/race';
import { useRaceViewTelemetry } from '@/hooks/race/useRaceViewTelemetry';

export default function RaceArenaAdmin() {
  useRaceViewTelemetry('/admin/race-arena', true);
  return (
    <>
      <Helmet>
        <title>Admin Race Arena — Console de gestão</title>
        <meta name="description" content="Console administrativo da Race Arena: gerencie temporadas, regras, garagem, badges e audite eventos." />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild size="icon" variant="ghost">
              <Link to="/race-arena" aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2 font-display">
                <Settings className="w-7 h-7 text-primary" /> Admin Race Arena
              </h1>
              <p className="text-sm text-muted-foreground">
                Curadoria total da gamificação de corrida — temporadas, regras e auditoria.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/race-arena/closer"><Flag className="w-4 h-4 mr-1.5" /> Pista Closers</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/race-arena/sdr"><Flag className="w-4 h-4 mr-1.5" /> Pista SDRs</Link>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="seasons" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="seasons">🏁 Temporadas</TabsTrigger>
            <TabsTrigger value="rules">🎯 Regras</TabsTrigger>
            <TabsTrigger value="garage">🚗 Garagem</TabsTrigger>
            <TabsTrigger value="badges">🏆 Badges</TabsTrigger>
            <TabsTrigger value="telemetry">📊 Telemetria UI</TabsTrigger>
            <TabsTrigger value="audit">📜 Auditoria</TabsTrigger>
          </TabsList>
          <TabsContent value="seasons" className="mt-4"><SeasonsManagerTable /></TabsContent>
          <TabsContent value="rules" className="mt-4"><SeasonRulesPanel /></TabsContent>
          <TabsContent value="garage" className="mt-4"><GarageAdminTable /></TabsContent>
          <TabsContent value="badges" className="mt-4"><RaceBadgeShowcase /></TabsContent>
          <TabsContent value="telemetry" className="mt-4"><OverlayTelemetryPanel /></TabsContent>
          <TabsContent value="audit" className="mt-4"><RaceAuditFeed /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
