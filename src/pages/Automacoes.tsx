import { WorkflowBuilder } from "@/components/automations/WorkflowBuilder";
import { Helmet } from "react-helmet-async";

export default function Automacoes() {
  return (
    <>
      <Helmet>
        <title>Automações Visuais | CHAMPION's GIFT By Promo Brindes</title>
        <meta name="description" content="Crie automações visuais com regras se/então para otimizar seu pipeline" />
      </Helmet>
      <WorkflowBuilder />
    </>
  );
}
