import { ClientsMap } from "@/components/map/ClientsMap";
import { PageTransition } from "@/components/transitions/PageTransition";

const MapaClientes = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <ClientsMap />
        </div>
      </div>
    </PageTransition>
  );
};

export default MapaClientes;
