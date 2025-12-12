import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const metricsData = [
  { title: "Receita Total", value: "R$ 847.250", change: 12.5, icon: DollarSign, positive: true },
  { title: "Novos Clientes", value: "89", change: 8.3, icon: Users, positive: true },
  { title: "Taxa de Conversão", value: "12.6%", change: -2.1, icon: TrendingDown, positive: false },
  { title: "Ticket Médio", value: "R$ 2.716", change: 15.7, icon: TrendingUp, positive: true },
];

const reportsData = [
  { nome: "Relatório de Vendas Mensal", tipo: "Vendas", data: "Dezembro 2024", formato: "PDF" },
  { nome: "Análise de Clientes", tipo: "Clientes", data: "Dezembro 2024", formato: "Excel" },
  { nome: "Performance de Produtos", tipo: "Produtos", data: "Dezembro 2024", formato: "PDF" },
  { nome: "Relatório Financeiro", tipo: "Financeiro", data: "Novembro 2024", formato: "PDF" },
  { nome: "Métricas de Conversão", tipo: "Marketing", data: "Novembro 2024", formato: "Excel" },
];

const Relatorios = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Relatórios</h1>
              <p className="text-sm text-muted-foreground">Análises e métricas do negócio</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="dezembro">
              <SelectTrigger className="w-40 glass">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="dezembro">Dezembro 2024</SelectItem>
                <SelectItem value="novembro">Novembro 2024</SelectItem>
                <SelectItem value="outubro">Outubro 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric, index) => (
            <div 
              key={metric.title}
              className="opacity-0 animate-fade-in-up glass rounded-xl p-5"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                  {metric.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(metric.change)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Reports List */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl" style={{ animationDelay: "300ms" }}>
          <div className="p-5 border-b border-border/50">
            <h2 className="text-lg font-semibold">Relatórios Disponíveis</h2>
            <p className="text-sm text-muted-foreground">Baixe relatórios detalhados</p>
          </div>
          <div className="divide-y divide-border/30">
            {reportsData.map((report, index) => (
              <div 
                key={index}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{report.nome}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{report.tipo}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{report.data}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted/50">{report.formato}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="glass">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
