import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { CareerTimeline } from '@/components/race/CareerTimeline';

export default function RaceArenaCareer() {
  const { data: myCar, isLoading } = useMyRaceCar();

  return (
    <>
      <Helmet>
        <title>Race Arena — Carreira</title>
        <meta
          name="description"
          content="Histórico vitalício de seasons, títulos e pódios na Race Arena."
        />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4 max-w-3xl">
        <header className="flex items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
              <Link to="/race-arena">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Hub
              </Link>
            </Button>
            <h1 className="text-3xl font-black flex items-center gap-3 font-display">
              <Trophy className="w-8 h-8 text-warning" /> Sua Carreira
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Cada season conta. Cada pódio é eterno.
            </p>
          </div>
        </header>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <CareerTimeline salespersonId={myCar?.salesperson_id} />
        )}
      </div>
    </>
  );
}
