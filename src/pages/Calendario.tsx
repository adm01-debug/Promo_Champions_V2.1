import { ActivityCalendar } from "@/components/calendar/ActivityCalendar";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/ui/page-transition";

export default function Calendario() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Calendário de Atividades | PROMO CHAMPIONS</title>
        <meta name="description" content="Visualize e reagende atividades no calendário com drag-and-drop" />
      </Helmet>
      <div className="p-4 lg:p-8">
        <ActivityCalendar />
      </div>
    </>
    </PageTransition>
  );
}
