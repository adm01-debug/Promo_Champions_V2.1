// MainLayout is already applied at route level in App.tsx
import { SalesAssistantChat } from '@/components/assistant/SalesAssistantChat';
import { Helmet } from "react-helmet-async";
import { Sparkles } from 'lucide-react';

export default function Assistente() {
  return (
    <>
      <Helmet>
        <title>Assistente IA | Promo Champions</title>
        <meta name="description" content="Assistente inteligente para vendas" />
      </Helmet>
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-page-title gradient-text">Assistente de Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Seu coach de vendas pessoal com IA
            </p>
          </div>
        </div>

        {/* Chat */}
        <div className="max-w-3xl mx-auto">
          <SalesAssistantChat />
        </div>
      </div>
    </>
    </>
  );
}
