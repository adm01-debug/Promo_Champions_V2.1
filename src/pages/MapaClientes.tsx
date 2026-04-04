import { Helmet } from "react-helmet-async";
import { ClientsMap } from "@/components/map/ClientsMap";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";
import { PageTransition } from "@/components/transitions/PageTransition";

const MapaClientes = () => {
  return (
    <Helmet>
      <title>Mapa de Clientes | Promo Champions</title>
      <meta name="description" content="Visualização geográfica de clientes" />
    </Helmet>
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <MapErrorBoundary>
            <ClientsMap />
          </MapErrorBoundary>
        </div>
      </div>
    </PageTransition>
  );
};

export default MapaClientes;
