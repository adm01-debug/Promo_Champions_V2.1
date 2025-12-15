import { MainLayout } from '@/components/layout/MainLayout';
import { SalesAssistantChat } from '@/components/assistant/SalesAssistantChat';
import { Sparkles } from 'lucide-react';

export default function Assistente() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Assistente de Vendas</h1>
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
    </MainLayout>
  );
}
