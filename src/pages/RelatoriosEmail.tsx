import { Helmet } from 'react-helmet-async';
import { EmailReportConfig } from '@/components/reports/EmailReportConfig';

export default function RelatoriosEmail() {
  return (
    <>
      <Helmet>
        <title>Relatórios por Email | CHAMPION's GIFT By Promo Brindes</title>
        <meta name="description" content="Configure o envio automático de relatórios de performance por email" />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios por Email</h1>
          <p className="text-muted-foreground">Configure relatórios automáticos de vendas e performance</p>
        </div>
        <EmailReportConfig />
      </div>
    </>
  );
}
