import { WorkflowBuilder } from "@/components/automations/WorkflowBuilder";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/ui/page-transition";

export default function Automacoes() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Automações Visuais | PROMO CHAMPIONS</title>
        <meta name="description" content="Crie automações visuais com regras se/então para otimizar seu pipeline" />
      </Helmet>
      <WorkflowBuilder />
    </>
    </PageTransition>
  );
}
