import { Helmet } from "react-helmet-async";
import { TerritoriesBoard } from '@/components/territories/TerritoriesBoard';
import { MapPin } from 'lucide-react';
import { PageTransition } from '@/components/transitions/PageTransition';

export default function Territorios() {
  return (
    <Helmet>
      <title>Territórios | Promo Champions</title>
      <meta name="description" content="Gestão de territórios de vendas" />
    </Helmet>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Territórios de Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe os territórios da equipe
            </p>
          </div>
        </div>

        <TerritoriesBoard />
      </div>
    </PageTransition>
  );
}
