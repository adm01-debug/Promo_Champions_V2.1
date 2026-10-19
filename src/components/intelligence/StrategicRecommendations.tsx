import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Target, Brain, Globe, Search } from 'lucide-react';
import { useLatestBriefing } from '@/hooks/executive-briefing/useLatestBriefing';

const intelligenceFeatures = [
  {
    title: 'Market Signals',
    desc: 'Monitoramento de funding, contratações e tech stack em tempo real.',
    icon: Globe,
    badge: 'Enterprise',
  },
  {
    title: 'Lead Enrichment',
    desc: 'Dados 360º de empresas e contatos sincronizados via API.',
    icon: Brain,
    badge: 'AI Powered',
  },
  {
    title: 'Visitor ID',
    desc: 'Identificação de empresas visitando seu site anonimamente.',
    icon: Search,
    badge: 'Real-time',
  },
];

export const StrategicRecommendations = () => {
  const navigate = useNavigate();
  const { data: briefing } = useLatestBriefing();
  const recommendations = (
    Array.isArray(briefing?.recommended_actions) ? briefing.recommended_actions : []
  ).slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Intelligence & Enrichment Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <Brain className="size-3" /> Data Enrichment & Market Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {intelligenceFeatures.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <feat.icon className="size-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/10"
                >
                  {feat.badge}
                </Badge>
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-tighter mb-2">
                {feat.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Zap className="size-3" /> One-Click Strategy Recommendations
          </h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              Nenhuma recomendação estratégica disponível — gere o briefing executivo para
              receber ações priorizadas por IA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}
                >
                  <Target className="size-12" />
                </div>

                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest">
                    {rec.module ? `Módulo: ${rec.module}` : 'Recomendado por IA'}
                  </Badge>
                </div>

                <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug mb-4">
                  {rec.rationale}
                </p>

                <Button
                  size="sm"
                  className="w-full h-8 text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/10 text-primary hover:bg-primary group/btn"
                  onClick={() => navigate('/atividades')}
                >
                  Ver Atividades{' '}
                  <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
