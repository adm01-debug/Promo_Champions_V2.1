import React from "react";
import { Helmet } from "react-helmet-async";
import { useCompetencyData } from "@/hooks/useCompetencyData";
import { CompetencyRadar } from "@/components/analytics/CompetencyRadar";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Target, 
  Lightbulb, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Competencias = () => {
  const { salesperson } = useAuth();
  const { data: competencyData, isLoading } = useCompetencyData(salesperson?.id);

  const getRecommendations = (data: any[]) => {
    return data
      .filter((d) => (d.value / d.maxValue) < 0.6)
      .map((d) => ({
        area: d.area,
        suggestion: `Melhore seu desempenho em ${d.area} focando em treinamentos específicos e práticas diárias.`,
        action: d.area === "Fechamento" ? "Revisar técnicas de fechamento" : 
                d.area === "Prospecção" ? "Aumentar volume de calls" :
                d.area === "Negociação" ? "Estudar BATNA e ancoragem" :
                "Consultar mentor da área"
      }));
  };

  const recommendations = competencyData ? getRecommendations(competencyData) : [];

  return (
    <>
      <Helmet>
        <title>Mapa de Competências | Promo Champions</title>
        <meta name="description" content="Análise detalhada de competências e plano de desenvolvimento." />
      </Helmet>
      <PageTransition>
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Mapa de Competências</h1>
              <p className="text-muted-foreground">Análise de skills, gaps e plano de evolução contínua.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="h-3.5 w-3.5 mr-2 text-primary" />
                IA Analítica Ativa
              </Badge>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <CompetencyRadar 
                data={competencyData} 
                title="Sua Matriz de Competências"
                className="h-full glass border-border/40 shadow-lg"
              />
            </motion.div>

            {/* Skills Matrix */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
              <Card className="glass border-border/40 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Matriz de Skills
                  </CardTitle>
                  <CardDescription>Visualização detalhada de pontos fortes e oportunidades de melhoria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    competencyData?.map((item, idx) => (
                      <div key={item.area} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.area}</span>
                          </div>
                          <span className="font-mono">{item.value}/{item.maxValue}</span>
                        </div>
                        <Progress value={(item.value / item.maxValue) * 100} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Development Plan */}
              <Card className="glass border-border/40 shadow-md border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Plano de Desenvolvimento Individual (PDI)
                  </CardTitle>
                  <CardDescription>Ações recomendadas pela IA baseadas em seus dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="mt-1">
                          <Lightbulb className="h-5 w-5 text-warning" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{rec.area}</p>
                          <p className="text-xs text-muted-foreground">{rec.suggestion}</p>
                          <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <ArrowUpRight className="h-3 w-3" />
                            Ação: {rec.action}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <CheckCircle2 className="h-12 w-12 text-success" />
                      <p className="font-medium">Excelente desempenho em todas as áreas!</p>
                      <p className="text-sm text-muted-foreground">Continue assim. Não há gaps críticos identificados no momento.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass border-border/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pontos Fortes</p>
                    <p className="text-xs text-muted-foreground">Competências acima de 80%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Atenção Necessária</p>
                    <p className="text-xs text-muted-foreground">Competências entre 40-60%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Treinamentos Sugeridos</p>
                    <p className="text-xs text-muted-foreground">Acesse a biblioteca de conteúdos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Competencias;