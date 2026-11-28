import { Helmet } from 'react-helmet-async';
import { ConversationalIntelligenceHub } from '@/components/conversational/ConversationalIntelligenceHub';

const ConversationalIntelligenceHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Insights Conversacionais | Promo Champions</title>
        <meta
          name="description"
          content="Inteligência conversacional: sentimento, sinais de compra e de risco, objeções e tendências em calls, e-mails e WhatsApp."
        />
      </Helmet>
      <main className="container mx-auto p-4 md:p-6">
        <ConversationalIntelligenceHub />
      </main>
    </>
  );
};

export default ConversationalIntelligenceHubPage;
