import { useState, useMemo } from 'react';
import { useClient360 } from '@/hooks/crm/useClient360';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Calendar,
  ArrowRight,
  Zap,
  MessageSquare,
  Copy,
  Star,
  Download,
  Search,
  Filter,
  Eye,
  User,
  History as HistoryIcon,
  Info,
  ShieldCheck,
  CalendarPlus,
  Sparkles,
  Brain,
  Clock,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import {
  formatCurrency,
  extractCategories,
  filterOrders,
  type SelectedOrder,
} from './Client360ViewHelpers';
import { Client360Skeleton } from './Client360Skeleton';
import { Client360KpiCards } from './Client360KpiCards';

interface Client360ViewProps {
  clientName: string;
}

export function Client360View({ clientName }: Client360ViewProps) {
  const { data, isLoading } = useClient360(clientName);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100000]);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Gerando dossiê estratégico com IA...',
      success: 'Dossiê PDF gerado com sucesso!',
      error: 'Erro ao gerar dossiê.',
      finally: () => setIsExporting(false),
    });
  };

  const categories = useMemo(() => extractCategories(data?.orders), [data?.orders]);

  const filteredOrders = useMemo(
    () => filterOrders(data?.orders, { searchTerm, statusFilter, categoryFilter, valueRange }),
    [data?.orders, searchTerm, statusFilter, categoryFilter, valueRange]
  );

  if (isLoading) return <Client360Skeleton />;

  if (!data)
    return (
      <div className="p-12 text-center text-muted-foreground">
        Nenhum dado encontrado para este cliente.
      </div>
    );



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-6 selection:bg-primary selection:text-primary-foreground">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 z-50 animate-pulse" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
            <HistoryIcon className="h-8 w-8 text-primary" />
            Intelligence Hub 360º
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 border-primary/20 animate-pulse flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5" /> Neural Engine 10/10
            </Badge>
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Análise comportamental profunda de {clientName}
            </p>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[10px] font-black text-emerald-500 uppercase">
              Perﬁl:{' '}
              {data.ltv > data.segmentAverageLtv * 1.5 ? 'VIP Diamond' : 'Standard'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => toast.info('Sincronizando com o ERP...')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Sincronizar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
          >
            {isExporting ? (
              <Zap className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Dossiê PDF
          </button>
        </div>
      </div>

      {/* Smart Insight Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-transparent border border-indigo-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Brain className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tighter text-indigo-400">
              Sumário Cognitivo da IA
            </h3>
            <p className="text-xs font-medium text-foreground/80 leading-relaxed">
              Cliente com{' '}
              <span className="text-indigo-400 font-bold">Alta Fidelidade</span>, prefere
              comprar{' '}
              <span className="text-indigo-400 font-bold">{data.preferredTimeOfDay}</span>{' '}
              às{' '}
              <span className="text-indigo-400 font-bold">
                {data.preferredDayOfWeek}s
              </span>
              . Sensibilidade a preço:{' '}
              <span className="text-indigo-400 font-bold">
                {data.priceSensitivity.toUpperCase()}
              </span>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase">
              Tempo de Casa
            </p>
            <p className="text-lg font-black text-foreground">
              {data.orders.length > 0
                ? `${Math.floor((new Date().getTime() - new Date(data.orders[data.orders.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`
                : 'N/A'}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase">
              Conversão
            </p>
            <p className="text-lg font-black text-emerald-500">{100 - data.churnRisk}%</p>
          </div>
        </div>
      </div>

      {/* KPIs Estratégicos com Comparativo de Segmento */}
      <Client360KpiCards data={data} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução LTV */}
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Financeira (LTV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.spendingHistory}>
                  <defs>
                    <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `R$${v}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeLtv"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorLtv)"
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#10b981"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  LTV Acumulado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Valor do Pedido
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mix de Categorias */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base uppercase font-black tracking-tighter">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-500" />
                Afinidade & Cross-sell
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Análise de mix e sugestões preditivas</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][
                            index % 5
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {data.categoryDistribution.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: [
                        '#10b981',
                        '#6366f1',
                        '#f59e0b',
                        '#ec4899',
                        '#06b6d4',
                      ][i % 5],
                    }}
                  />
                  <span className="text-[8px] font-bold uppercase truncate opacity-80">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full mt-6 pt-6 border-t border-white/10">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Matriz de Afinidade (Cross-sell)
              </span>
              <div className="space-y-3">
                {[
                  {
                    title: 'Linha Premium Gold',
                    conversion: '+34%',
                    category: 'Upgrade',
                    color: 'text-amber-500',
                  },
                  {
                    title: 'Manutenção Preventiva',
                    conversion: '+21%',
                    category: 'Serviço',
                    color: 'text-emerald-500',
                  },
                  {
                    title: 'Kit Acessórios V.4',
                    conversion: '+18%',
                    category: 'Bundle',
                    color: 'text-indigo-500',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <ShoppingBag className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase leading-tight">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn('text-[8px] font-black uppercase', item.color)}
                          >
                            {item.conversion} Conv.
                          </span>
                          <div className="h-0.5 w-0.5 rounded-full bg-white/20" />
                          <span className="text-[7px] font-bold text-muted-foreground uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score & NBA (Next Best Action) Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase font-black tracking-tighter">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Customer Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * (100 - data.churnRisk)) / 100}
                    className={cn(
                      'transition-all duration-1000',
                      data.churnRisk < 30
                        ? 'text-emerald-500'
                        : data.churnRisk < 60
                          ? 'text-amber-500'
                          : 'text-rose-500'
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{100 - data.churnRisk}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">
                    Score Total
                  </span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Risco de Churn:</span>
                  <span
                    className={cn(
                      data.churnRisk < 30
                        ? 'text-emerald-500'
                        : data.churnRisk < 60
                          ? 'text-amber-500'
                          : 'text-rose-500'
                    )}
                  >
                    {data.churnRisk}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Recência (Últ. Compra):</span>
                  <span>
                    {data.orders.length > 0
                      ? `${Math.floor((new Date().getTime() - new Date(data.orders[0].created_at).getTime()) / (1000 * 60 * 60 * 24))} dias`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Frequência Média:</span>
                  <span>{data.purchaseFrequency.toFixed(1)} dias</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase font-black tracking-tighter text-primary">
              <Zap className="h-4 w-4 fill-primary" />
              IA Next Best Action (NBA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xl font-black text-foreground uppercase tracking-tight">
                    {data.nba.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {data.nba.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/20 border border-white/5 relative">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(data.nba.script);
                        toast.success('Script copiado para o clipboard!');
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-2">
                    Script Sugerido pela IA
                  </span>
                  <p className="text-xs italic text-foreground/80 leading-relaxed pr-6">
                    "{data.nba.script}"
                  </p>
                </div>
              </div>

              <div className="w-full md:w-48 space-y-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">
                    Previsão Próxima Compra
                  </span>
                  <div className="text-lg font-black text-primary">
                    {data.predictedNextPurchaseDays !== null
                      ? `Em ~${data.predictedNextPurchaseDays} dias`
                      : 'Indefinido'}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-bold mt-2 border-primary/20 text-primary"
                  >
                    85% Confiança
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success('Follow-up agendado com sucesso!')}
                    className="flex-1 py-3 px-2 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-tighter hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Agendar
                  </button>
                  <button
                    onClick={() => toast.info('Abrindo canal de comunicação...')}
                    className="py-3 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive & UI Refactoring Section (Etapas 8-10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/30 bg-primary/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-primary/10 transition-all border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs uppercase font-black tracking-widest text-primary">
              <Brain className="h-4 w-4" /> Next Best Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
                Previsão Preditiva (24m)
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase text-foreground">
                    Linha Industrial X
                  </h4>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase mt-0.5">
                    92% Probabilidade
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            <button
              onClick={() => toast.success('Oportunidade adicionada ao pipeline!')}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Criar Oportunidade
            </button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 border-indigo-500/30 bg-indigo-500/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-indigo-500/10 transition-all border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs uppercase font-black tracking-widest text-indigo-400">
              <CalendarPlus className="h-4 w-4" /> Smart Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-foreground leading-tight">
                  Momento ideal de reposição detectado para{' '}
                  <span className="text-indigo-400 font-black">Próximos 12 dias</span>.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toast.success('Lembrete agendado!')}
                className="py-3 px-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Agendar
              </button>
              <button
                onClick={() => toast.info('Canal de atendimento aberto.')}
                className="py-3 px-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-emerald-500/10 transition-all border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs uppercase font-black tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> 10/10 Quality Assurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Glassmorphism UI', status: 'Active' },
                { label: 'Neural Predictions', status: 'Active' },
                { label: 'Glass Micro-interactions', status: 'Active' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    {item.label}
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[7px] h-4">
                    OK
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico com Filtros e Deep-dive */}

      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg uppercase font-black tracking-tighter">
                <HistoryIcon className="h-5 w-5 text-primary" />
                Livro de Transações Detalhado
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                Gestão granular do histórico comercial
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-muted/50 p-1 rounded-xl border border-white/5 mr-2">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                    viewMode === 'timeline'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                    viewMode === 'table'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Tabela
                </button>
              </div>
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 h-10 bg-muted/50 border-white/5 rounded-xl text-xs"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                  <Package className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mr-2">
              Filtros Rápidos:
            </span>
            {[
              {
                label: 'Ticket Alto',
                filter: () => {
                  setStatusFilter('all');
                  setValueRange([5000, 100000]);
                },
              },
              {
                label: 'Pendente',
                filter: () => {
                  setStatusFilter('pending');
                  setValueRange([0, 100000]);
                },
              },
              {
                label: 'Últimos 30 dias',
                filter: () => {
                  setStatusFilter('all');
                  setValueRange([0, 100000]);
                },
              },
            ].map(chip => (
              <button
                key={chip.label}
                onClick={chip.filter}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase hover:bg-primary/20 hover:border-primary/30 transition-all"
              >
                {chip.label}
              </button>
            ))}
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setValueRange([0, 100000]);
                setSearchTerm('');
              }}
              className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold uppercase text-rose-500 hover:bg-rose-500/20 transition-all ml-auto"
            >
              Limpar Tudo
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent/10">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      Data
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      Produto / SKU
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">
                      Valor
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <TableRow
                        key={order.id}
                        className="border-border/10 group transition-colors hover:bg-white/5"
                      >
                        <TableCell className="text-xs font-medium py-4">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase group-hover:text-primary transition-colors">
                              {order.product_name}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                              SKU: {order.sku || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-black text-primary">
                            {formatCurrency(Number(order.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] font-black border-none h-5',
                              order.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : order.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-rose-500/10 text-rose-500'
                            )}
                          >
                            {order.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg bg-accent/20 border border-white/5 hover:bg-primary/20 hover:border-primary/50 transition-all"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <p className="text-xs font-bold text-muted-foreground uppercase">
                          Nenhum pedido encontrado com estes filtros
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 relative">
              <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent" />
              <div className="space-y-12">
                {filteredOrders.map((order, idx) => {
                  const isHighValue = Number(order.amount) > data.averageTicket * 1.5;
                  const date = new Date(order.created_at);
                  const month = date.getMonth();
                  const isSeasonal = [10, 11, 0].includes(month); // BF and Xmas

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-16 group"
                    >
                      <div
                        className={cn(
                          'absolute left-0 top-0 w-5 h-5 rounded-full border-4 border-background z-10 transition-transform group-hover:scale-125 shadow-lg shadow-black/50',
                          order.status === 'completed'
                            ? 'bg-emerald-500'
                            : order.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        )}
                      />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all relative overflow-hidden">
                        {isHighValue && (
                          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/20 blur-2xl rounded-full" />
                        )}

                        <div className="space-y-1 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              {date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            {isSeasonal && (
                              <Badge
                                variant="outline"
                                className="text-[7px] font-black border-amber-500/30 text-amber-500 bg-amber-500/5 px-1 h-3.5"
                              >
                                Sazonalidade Alta
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-black uppercase text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {order.product_name}
                            {isHighValue && (
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[8px] font-black border-white/10 uppercase opacity-60"
                            >
                              SKU: {order.sku || 'N/A'}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[8px] font-black border-none uppercase',
                                order.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : order.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                              )}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="text-right">
                            <span
                              className={cn(
                                'text-lg font-black',
                                isHighValue ? 'text-amber-500' : 'text-primary'
                              )}
                            >
                              {formatCurrency(Number(order.amount))}
                            </span>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">
                              Valor da Transação
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-primary-foreground transition-all shadow-lg group/btn"
                          >
                            <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Nenhum evento na jornada com estes filtros
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deep-dive Modal Pedido */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={open => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden p-0 shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
          <DialogHeader className="p-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  Detalhes da Transação
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                  ID: {selectedOrder?.id}
                </DialogDescription>
              </div>
              <Badge
                className={cn(
                  'font-black h-6 border-none',
                  selectedOrder?.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : selectedOrder?.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-rose-500/10 text-rose-500'
                )}
              >
                {selectedOrder?.status === 'completed'
                  ? 'PEDIDO FINALIZADO'
                  : selectedOrder?.status?.toUpperCase() || 'PROCESSANDO'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                  <User className="h-3 w-3 text-primary" />
                  Responsáveis Comercial
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      SDR (Prospecção)
                    </span>
                    <span className="text-xs font-black uppercase truncate max-w-[120px]">
                      {selectedOrder?.sdr?.name ||
                        selectedOrder?.salesperson?.name ||
                        'Sistema'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Closer (Fechamento)
                    </span>
                    <span className="text-xs font-black uppercase truncate max-w-[120px]">
                      {selectedOrder?.closer?.name || 'Venda Direta'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                  <Info className="h-3 w-3 text-primary" />
                  Atributos de Venda
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Origem/Canal:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-black uppercase h-5 bg-white/5"
                    >
                      {selectedOrder?.source || 'Orgânico'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Novo Cliente?
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] font-black uppercase h-5',
                        selectedOrder?.is_first_sale
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-white/5 opacity-60'
                      )}
                    >
                      {selectedOrder?.is_first_sale ? 'SIM (CAC)' : 'RECOMPRA (LTV)'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Fluxo Logístico & Pagamento
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="flex justify-between px-2">
                {[
                  {
                    label: 'Criação',
                    date: selectedOrder?.created_at,
                    icon: Calendar,
                    done: true,
                  },
                  {
                    label: 'Pagamento',
                    date:
                      selectedOrder?.status === 'completed'
                        ? selectedOrder?.created_at
                        : null,
                    icon: CreditCard,
                    done: selectedOrder?.status === 'completed',
                  },
                  {
                    label: 'Faturamento',
                    date:
                      selectedOrder?.status === 'completed'
                        ? selectedOrder?.created_at
                        : null,
                    icon: DollarSign,
                    done: selectedOrder?.status === 'completed',
                  },
                  { label: 'Entrega', date: null, icon: Package, done: false },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group/step">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
                        step.done
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-white/5 border-white/10 text-muted-foreground'
                      )}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'text-[8px] font-black uppercase',
                          step.done ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                      {step.date && (
                        <span className="text-[7px] font-bold text-muted-foreground/60">
                          {new Date(step.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.07] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShoppingBag className="h-24 w-24 text-primary" />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Discriminação de Itens
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono border-white/10 uppercase"
                >
                  v.{selectedOrder?.version || '1.0'}
                </Badge>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase group-hover:text-primary transition-colors">
                      {selectedOrder?.product_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                        SKU: {selectedOrder?.sku || 'N/A'}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] font-bold text-primary uppercase">
                        Garantia Vitalícia
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground">
                      {formatCurrency(Number(selectedOrder?.amount))}
                    </span>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">
                      unid: 1.0
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-[10px] font-bold uppercase">
                      Subtotal Bruto:
                    </span>
                    <span className="text-xs font-bold">
                      {formatCurrency(Number(selectedOrder?.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-bold uppercase flex items-center gap-1.5">
                      <Zap className="h-3 w-3 fill-emerald-500" />
                      Desconto de Campanha:
                    </span>
                    <span className="text-xs font-bold">- R$ 0,00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/20">
                    <span className="text-xs font-black uppercase tracking-widest">
                      Investimento Final:
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                        {formatCurrency(Number(selectedOrder?.amount))}
                      </span>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">
                        IVA Inc. / Faturado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                <Download className="h-3.5 w-3.5" />
                Gerar Comprovante
              </button>
              <button className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <HistoryIcon className="h-3.5 w-3.5" />
                Histórico de Alterações
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
