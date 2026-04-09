import { Helmet } from 'react-helmet-async';
import { EmailReportConfig } from '@/components/reports/EmailReportConfig';
import { PageTransition } from "@/components/ui/page-transition";

export default function RelatoriosEmail() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Relatórios por Email | PROMO CHAMPIONS</title>
        <meta name="description" content="Configure o envio automático de relatórios de performance por email" />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-page-title">Relatórios por Email</h1>
          <p className="text-muted-foreground">Configure relatórios automáticos de vendas e performance</p>
        </div>
        <EmailReportConfig />
      </div>
    </>
    </PageTransition>
  );
}
