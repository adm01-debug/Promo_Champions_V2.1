import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Trophy, Sparkles, BarChart3 } from 'lucide-react';
import { RaceArenaHeader } from '@/components/race/RaceArenaHeader';
import { useRaceUnlocks, useUnlockRaceItem } from '@/hooks/race/useRaceUnlocks';
import { RACE_UNLOCK_CATALOG, LEAGUE_LABELS, type RaceUnlockItem } from '@/components/race/garage/raceUnlockCatalog';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';

export default function RaceArenaGarage() {
  const { data: unlocks = [] } = useRaceUnlocks();
  const { data: car } = useMyRaceCar();
  const unlockMutation = useUnlockRaceItem();
  const unlockedKeys = new Set(unlocks.map((u) => u.unlock_key));

  const decals = RACE_UNLOCK_CATALOG.filter((i) => i.category === 'decal');
  const neons = RACE_UNLOCK_CATALOG.filter((i) => i.category === 'neon');
  const skins = RACE_UNLOCK_CATALOG.filter((i) => i.category === 'skin');

  return (
    <>
      <Helmet>
        <title>Garagem | Race Arena</title>
        <meta name="description" content="Sua garagem pessoal: troféus, skins desbloqueáveis e estatísticas de carreira." />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4">
        <RaceArenaHeader
          title="Garagem"
          emoji="🏆"
          subtitle="Troféus, customizações e estatísticas de carreira"
          breadcrumbCurrent="Garagem"
        />

        <Tabs defaultValue="trophies" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="trophies" className="gap-2"><Trophy className="h-4 w-4" />Troféus</TabsTrigger>
            <TabsTrigger value="cars" className="gap-2"><Sparkles className="h-4 w-4" />Carros</TabsTrigger>
            <TabsTrigger value="stats" className="gap-2"><BarChart3 className="h-4 w-4" />Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="trophies" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Vitrine de Troféus</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Vitórias', value: car?.total_wins ?? 0, icon: '🥇' },
                    { label: 'Corridas', value: car?.total_races ?? 0, icon: '🏁' },
                    { label: 'Ultrapassagens', value: car?.total_overtakes ?? 0, icon: '⚡' },
                    { label: 'Itens Desbloqueados', value: unlocks.length, icon: '🔓' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-3xl mb-1" aria-hidden>{s.icon}</div>
                      <div className="text-2xl font-black font-display">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cars" className="mt-4 space-y-4">
            <UnlockSection title="Decals" items={decals} unlockedKeys={unlockedKeys} onUnlock={(k, l) => unlockMutation.mutate({ unlockKey: k, requiredLeague: l })} />
            <UnlockSection title="Neons" items={neons} unlockedKeys={unlockedKeys} onUnlock={(k, l) => unlockMutation.mutate({ unlockKey: k, requiredLeague: l })} />
            <UnlockSection title="Skins" items={skins} unlockedKeys={unlockedKeys} onUnlock={(k, l) => unlockMutation.mutate({ unlockKey: k, requiredLeague: l })} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Estatísticas de Carreira</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <StatRow label="Apelido do piloto" value={car?.nickname ?? '—'} />
                  <StatRow label="Frase de vitória" value={car?.victory_quote ?? '—'} />
                  <StatRow label="Estilo de carro" value={car?.car_style?.toUpperCase() ?? '—'} />
                  <StatRow label="Número" value={`#${car?.car_number ?? '—'}`} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function UnlockSection({
  title, items, unlockedKeys, onUnlock,
}: {
  title: string;
  items: RaceUnlockItem[];
  unlockedKeys: Set<string>;
  onUnlock: (key: string, league: string) => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => {
            const unlocked = unlockedKeys.has(item.key);
            return (
              <div
                key={item.key}
                className="relative rounded-lg border bg-card p-3 flex flex-col items-center text-center gap-2"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: item.previewColor, opacity: unlocked ? 1 : 0.4 }}
                  aria-hidden
                >
                  {!unlocked && <Lock className="h-6 w-6 text-foreground/80" />}
                </div>
                <div className="font-semibold text-sm">{item.label}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                <Badge variant={unlocked ? 'default' : 'secondary'} className="text-xs">
                  {unlocked ? 'Desbloqueado' : `Liga ${LEAGUE_LABELS[item.requiredLeague]}`}
                </Badge>
                {!unlocked && (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => onUnlock(item.key, item.requiredLeague)}>
                    Tentar desbloquear
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
