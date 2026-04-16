import React, { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AIEmailWriterProps {
  dealId: string;
  clientName: string;
  productName: string;
  amount: number;
  stage: string;
}

type EmailTone = "formal" | "friendly" | "urgent";
type EmailType = "followup" | "proposal" | "intro" | "objection" | "close";

const TEMPLATES: Record<EmailType, Record<EmailTone, (ctx: AIEmailWriterProps) => string>> = {
  intro: {
    formal: (c) => `Prezado(a),\n\nEspero que esteja bem. Sou responsável pela área comercial e gostaria de apresentar nossa solução para ${c.clientName}.\n\nTemos uma proposta especial no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)} para ${c.productName}, que pode trazer resultados significativos para sua operação.\n\nPodemos agendar uma conversa de 15 minutos para discutirmos?\n\nAtenciosamente`,
    friendly: (c) => `Olá! 👋\n\nTudo bem? Sou da equipe comercial e vi que ${c.clientName} pode se beneficiar do ${c.productName}.\n\nTemos uma condição especial que achei que seria interessante compartilhar. Posso te contar mais?\n\nAbraço!`,
    urgent: (c) => `Olá,\n\nEntro em contato pois temos uma oportunidade limitada para ${c.clientName}: ${c.productName} com condições especiais que expiram esta semana.\n\nValor: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}\n\nPodemos conversar hoje?\n\nAguardo retorno urgente.`,
  },
  followup: {
    formal: (c) => `Prezado(a),\n\nGostaria de dar continuidade à nossa conversa sobre ${c.productName} para ${c.clientName}.\n\nA proposta de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)} continua vigente e ficarei à disposição para esclarecer qualquer dúvida.\n\nQuando seria o melhor momento para alinharmos?\n\nAtenciosamente`,
    friendly: (c) => `Oi! 😊\n\nPassando para saber se teve a oportunidade de avaliar nossa proposta de ${c.productName}.\n\nSei que a rotina é corrida, mas não quero que ${c.clientName} perca essa oportunidade. Posso ajudar com alguma dúvida?\n\nAbraço!`,
    urgent: (c) => `Olá,\n\nNotei que ainda não tivemos retorno sobre a proposta para ${c.clientName}. As condições especiais do ${c.productName} estão se encerrando.\n\nPreciso de uma posição até amanhã para garantir o valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}.\n\nAguardo!`,
  },
  proposal: {
    formal: (c) => `Prezado(a),\n\nConforme alinhado, segue nossa proposta comercial para ${c.clientName}:\n\n• Produto/Serviço: ${c.productName}\n• Valor: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}\n• Condições: Pagamento em 30/60/90 dias\n• Validade: 15 dias úteis\n\nEstou à disposição para discutirmos os termos.\n\nAtenciosamente`,
    friendly: (c) => `Oi! 🎉\n\nPreparei a proposta que combinamos! Aqui vai:\n\n✅ ${c.productName}\n💰 ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}\n📅 Condições flexíveis\n\nO que acha? Posso ajustar algo?\n\nAbraço!`,
    urgent: (c) => `Olá,\n\nSegue proposta URGENTE para ${c.clientName}:\n\n${c.productName} — ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}\n\nEsta condição é válida apenas até sexta-feira. Recomendo aprovação imediata.\n\nAguardo confirmação.`,
  },
  objection: {
    formal: (c) => `Prezado(a),\n\nCompreendo suas preocupações em relação ao ${c.productName}. Gostaria de endereçar cada ponto:\n\n1. Sobre o valor: O investimento de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)} representa um ROI médio de 3x em 6 meses\n2. Sobre implementação: Garantimos suporte dedicado na fase inicial\n3. Sobre resultados: Nossos cases mostram resultados em até 90 dias\n\nPodemos agendar uma call para aprofundarmos?\n\nAtenciosamente`,
    friendly: (c) => `Oi!\n\nEntendo total suas dúvidas! É normal ter receio antes de um investimento. Mas olha só:\n\n• Clientes similares a ${c.clientName} tiveram ROI em 3 meses\n• O suporte é humanizado e dedicado\n• Temos garantia de resultado\n\nQue tal uma call rápida para eu mostrar os cases?\n\nAbraço!`,
    urgent: (c) => `Olá,\n\nSei que há pendências sobre a proposta para ${c.clientName}. Preciso resolver isso hoje:\n\n- Posso oferecer desconto adicional de 10% se fecharmos esta semana\n- Implementação prioritária garantida\n\nEssa é a melhor condição que conseguimos. Vamos fechar?`,
  },
  close: {
    formal: (c) => `Prezado(a),\n\nApós nossas conversas produtivas, gostaria de formalizar o fechamento da proposta de ${c.productName} para ${c.clientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}.\n\nPara prosseguirmos, preciso apenas da confirmação por escrito. Envio o contrato em anexo.\n\nParabéns pela decisão!\n\nAtenciosamente`,
    friendly: (c) => `Oi! 🎉🎊\n\nQue ótima decisão! Vamos oficializar o ${c.productName} para ${c.clientName}!\n\nPróximos passos:\n1. Assinar contrato (envio hoje)\n2. Kickoff na próxima semana\n3. Resultados em 30 dias!\n\nBem-vindo(a) à bordo! 🚀`,
    urgent: (c) => `Olá,\n\nConfirmo o fechamento de ${c.productName} para ${c.clientName} — ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.amount)}.\n\nEnvio contrato agora. Preciso da assinatura até EOD para garantir as condições acordadas.\n\nVamos!`,
  },
};

export const AIEmailWriter = React.memo(({ dealId, clientName, productName, amount, stage }: AIEmailWriterProps) => {
  const [emailType, setEmailType] = useState<EmailType>("followup");
  const [tone, setTone] = useState<EmailTone>("friendly");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const template = TEMPLATES[emailType]?.[tone];
      if (template) {
        setGeneratedEmail(template({ dealId, clientName, productName, amount, stage }));
      }
      setIsGenerating(false);
    }, 600);
  }, [emailType, tone, dealId, clientName, productName, amount, stage]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    toast.success("Email copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [generatedEmail]);

  return (
    <Card className="p-4 glass border-border/40 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="font-display font-semibold text-sm">Email AI Writer</h4>
      </div>

      <div className="flex gap-2">
        <Select value={emailType} onValueChange={(v) => setEmailType(v as EmailType)}>
          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="intro">Introdução</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
            <SelectItem value="proposal">Proposta</SelectItem>
            <SelectItem value="objection">Objeção</SelectItem>
            <SelectItem value="close">Fechamento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="friendly">Amigável</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8 gap-1 text-xs" onClick={generate} disabled={isGenerating}>
          {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Gerar
        </Button>
      </div>

      {generatedEmail && (
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-1">
          <Textarea
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="min-h-[150px] text-xs"
          />
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado!" : "Copiar Email"}
          </Button>
        </div>
      )}
    </Card>
  );
});
AIEmailWriter.displayName = "AIEmailWriter";
