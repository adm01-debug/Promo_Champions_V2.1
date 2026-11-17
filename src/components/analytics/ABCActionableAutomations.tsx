import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowUpRight, Boxes, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

interface ABCItem {
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

export interface AbcAutomation {
  id: string;
  title: string;
  /** Frase com o numero medido. Nenhum valor aqui e estimado. */
  finding: string;
  action: string;
  severity: 'risk' | 'opportunity' | 'efficiency';
}

/** Receita concentrada no top-3 a partir da qual a dependencia vira risco. */
export const CONCENTRATION_RISK_PCT = 50;
/** Abaixo desta fatia, a cauda classe C justifica atendimento padronizado. */
export const LONG_TAIL_MAX_PCT = 10;

const pct = (n: number) => `${n.toFixed(1)}%`;
const brl = (n: number) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

/**
 * Deriva automacoes acionaveis da curva ABC ja calculada. Funcao pura: cada
 * item cita o numero de onde saiu, e nada e gerado quando o dado nao sustenta
 * a afirmacao (lista vazia -> a secao nao aparece).
 */
export function buildAbcAutomations(
  clients: ABCItem[],
  products: ABCItem[],
  totalRevenue: number
): AbcAutomation[] {
  if (!clients.length || totalRevenue <= 0) return [];

  const out: AbcAutomation[] = [];
  const share = (items: ABCItem[]) =>
    (items.reduce((s, i) => s + i.revenue, 0) / totalRevenue) * 100;

  const classA = clients.filter(c => c.classification === 'A');
  const classB = clients.filter(c => c.classification === 'B');
  const classC = clients.filter(c => c.classification === 'C');

  if (classA.length) {
    const aShare = share(classA);
    out.push({
      id: 'carteira-classe-a',
      title: 'Carteira classe A',
      finding: `${classA.length} ${classA.length === 1 ? 'cliente responde' : 'clientes respondem'} por ${pct(aShare)} da receita ganha (${brl(classA.reduce((s, c) => s + c.revenue, 0))}).`,
      action:
        aShare > CONCENTRATION_RISK_PCT
          ? 'Criar rotina de contato recorrente para esses clientes: perdê-los derruba mais da metade do faturamento.'
          : 'Manter rotina de contato recorrente para esses clientes.',
      severity: aShare > CONCENTRATION_RISK_PCT ? 'risk' : 'opportunity',
    });
  }

  if (classB.length) {
    out.push({
      id: 'promover-classe-b',
      title: 'Classe B é o alvo de maior retorno',
      finding: `${classB.length} ${classB.length === 1 ? 'cliente soma' : 'clientes somam'} ${pct(share(classB))} da receita.`,
      action:
        'Priorizar campanha nesses clientes: subir de B para A rende mais que buscar cliente novo.',
      severity: 'opportunity',
    });
  }

  if (classC.length) {
    const cShare = share(classC);
    if (cShare <= LONG_TAIL_MAX_PCT) {
      out.push({
        id: 'cauda-classe-c',
        title: 'Cauda longa classe C',
        finding: `${classC.length} clientes somam apenas ${pct(cShare)} da receita.`,
        action:
          'Padronizar o atendimento dessa faixa (cadência automática) e liberar tempo do time para A e B.',
        severity: 'efficiency',
      });
    }
  }

  const topProduct = products[0];
  if (topProduct && products.length > 1) {
    const prodTotal = products.reduce((s, p) => s + p.revenue, 0);
    if (prodTotal > 0) {
      const topShare = (topProduct.revenue / prodTotal) * 100;
      if (topShare > CONCENTRATION_RISK_PCT) {
        out.push({
          id: 'dependencia-produto',
          title: 'Dependência de um produto',
          finding: `${topProduct.name} responde por ${pct(topShare)} da receita de produtos.`,
          action:
            'Reduzir a dependência: puxar o segundo e o terceiro produto nas propostas em aberto.',
          severity: 'risk',
        });
      }
    }
  }

  return out;
}

const ICON = {
  risk: AlertTriangle,
  opportunity: ArrowUpRight,
  efficiency: Workflow,
} as const;

const TOM = {
  risk: 'bg-status-error/20 text-status-error',
  opportunity: 'bg-status-success/20 text-status-success',
  efficiency: 'bg-primary/20 text-primary',
} as const;

const ROTULO = {
  risk: 'Risco',
  opportunity: 'Oportunidade',
  efficiency: 'Eficiência',
} as const;

interface ABCActionableAutomationsProps {
  automations: AbcAutomation[];
}

export function ABCActionableAutomations({ automations }: ABCActionableAutomationsProps) {
  if (!automations.length) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
      {automations.map((a, index) => {
        const Icon = ICON[a.severity];
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-border/40 hover:border-primary/40 transition-all duration-500 group overflow-hidden relative h-full">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Boxes className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${TOM[a.severity]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-section-title text-sm uppercase tracking-wider">
                    {a.title}
                  </CardTitle>
                  <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                    {ROTULO[a.severity]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground leading-relaxed">{a.finding}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.action}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
