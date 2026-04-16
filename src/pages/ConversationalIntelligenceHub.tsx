import { Helmet } from "react-helmet-async";
import { ConversationalIntelligenceHub } from "@/components/conversational/ConversationalIntelligenceHub";

const ConversationalIntelligenceHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Conversational Intelligence | Promo Champions</title>
        <meta
          name="description"
          content="Análise de chamadas com IA: sentimento, talk ratio, objeções e próximos passos automatizados."
        />
        <link rel="canonical" href="/conversational-intelligence" />
      </Helmet>
      <main className="container mx-auto p-4 md:p-6">
        <ConversationalIntelligenceHub />
      </main>
    </>
  );
};

export default ConversationalIntelligenceHubPage;
