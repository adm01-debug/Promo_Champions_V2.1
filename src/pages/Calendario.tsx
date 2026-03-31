import { ActivityCalendar } from "@/components/calendar/ActivityCalendar";
import { Helmet } from "react-helmet-async";

export default function Calendario() {
  return (
    <>
      <Helmet>
        <title>Calendário de Atividades | I HAVE THE POWER!</title>
        <meta name="description" content="Visualize e reagende atividades no calendário com drag-and-drop" />
      </Helmet>
      <div className="p-4 lg:p-8">
        <ActivityCalendar />
      </div>
    </>
  );
}
