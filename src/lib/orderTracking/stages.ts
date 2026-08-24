import {
  ShoppingCart,
  Truck,
  ListChecks,
  Sparkles,
  PackageOpen,
  PackageCheck,
  MapPin,
  Home,
  HeartHandshake,
  FileText,
  Wallet,
  CheckCircle2,
  CircleDollarSign,
  Headphones,
  Star,
  type LucideIcon,
} from "lucide-react";

export type TrackKey = "operational" | "financial" | "post_sale";

export type OperationalStage =
  | "compras"
  | "logistica_entrada"
  | "triagem"
  | "personalizacao"
  | "manuseio"
  | "expedicao"
  | "logistica_final"
  | "entregue";

export type FinancialStage = "nf_emitida" | "parcela_paga" | "em_dia" | "quitado";

export type PostSaleStage = "pos_venda" | "suporte" | "nps";

export type TrackingStageKey = OperationalStage | FinancialStage | PostSaleStage;

export type StageState = "done" | "current" | "pending" | "blocked";

export interface StageDef {
  key: TrackingStageKey;
  label: string;
  description: string;
  icon: LucideIcon;
  track: TrackKey;
  order: number;
}

export interface TrackDef {
  key: TrackKey;
  label: string;
  icon: LucideIcon;
  accent: string; // tailwind semantic token suffix (primary | success | warning)
  stages: StageDef[];
}

export const OPERATIONAL_STAGES: StageDef[] = [
  { key: "compras", label: "Compras", description: "Insumos e materiais sendo adquiridos", icon: ShoppingCart, track: "operational", order: 1 },
  { key: "logistica_entrada", label: "Logística", description: "Recebimento e conferência no CD", icon: Truck, track: "operational", order: 2 },
  { key: "triagem", label: "Triagem", description: "Separação e validação dos itens", icon: ListChecks, track: "operational", order: 3 },
  { key: "personalizacao", label: "Personalização", description: "Gravação, bordado ou customização", icon: Sparkles, track: "operational", order: 4 },
  { key: "manuseio", label: "Manuseio", description: "Embalagem e montagem do kit", icon: PackageOpen, track: "operational", order: 5 },
  { key: "expedicao", label: "Expedição", description: "Despacho liberado para transportadora", icon: PackageCheck, track: "operational", order: 6 },
  { key: "logistica_final", label: "Logística Final", description: "A caminho do cliente", icon: MapPin, track: "operational", order: 7 },
  { key: "entregue", label: "Entregue", description: "Recebido pelo cliente", icon: Home, track: "operational", order: 8 },
];

export const FINANCIAL_STAGES: StageDef[] = [
  { key: "nf_emitida", label: "Nota Fiscal Emitida", description: "NF-e validada e enviada", icon: FileText, track: "financial", order: 1 },
  { key: "parcela_paga", label: "Primeira Parcela Paga", description: "Entrada confirmada", icon: Wallet, track: "financial", order: 2 },
  { key: "em_dia", label: "Pagamentos em Dia", description: "Parcelas seguindo cronograma", icon: CircleDollarSign, track: "financial", order: 3 },
  { key: "quitado", label: "Quitado", description: "Pedido 100% pago", icon: CheckCircle2, track: "financial", order: 4 },
];

export const POST_SALE_STAGES: StageDef[] = [
  { key: "pos_venda", label: "Pós-Venda", description: "Contato de qualidade 7 dias", icon: HeartHandshake, track: "post_sale", order: 1 },
  { key: "suporte", label: "Suporte Ativo", description: "Acompanhamento e dúvidas", icon: Headphones, track: "post_sale", order: 2 },
  { key: "nps", label: "NPS Coletado", description: "Pesquisa de satisfação respondida", icon: Star, track: "post_sale", order: 3 },
];

export const TRACKS: TrackDef[] = [
  { key: "operational", label: "Operacional", icon: Truck, accent: "primary", stages: OPERATIONAL_STAGES },
  { key: "financial", label: "Financeiro", icon: Wallet, accent: "success", stages: FINANCIAL_STAGES },
  { key: "post_sale", label: "Pós-Venda", icon: HeartHandshake, accent: "warning", stages: POST_SALE_STAGES },
];

export const ALL_STAGES: StageDef[] = [...OPERATIONAL_STAGES, ...FINANCIAL_STAGES, ...POST_SALE_STAGES];

export function getStage(key: TrackingStageKey): StageDef | undefined {
  return ALL_STAGES.find((s) => s.key === key);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (v: number) => brl.format(v || 0);

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
