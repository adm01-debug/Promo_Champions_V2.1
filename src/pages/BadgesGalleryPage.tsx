import { Helmet } from "react-helmet-async";
import { BadgesGallery } from "@/components/competitive/BadgesGallery";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Trophy, Award, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function BadgesGalleryPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Galeria de Badges | Promo Champions</title>
        <meta name="description" content="Sua coleção completa de conquistas e badges desbloqueáveis" />
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rank-gold to-coins shadow-lg shadow-rank-gold/20">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-page-title gradient-text">Coleção de Elite</h1>
              <p className="text-sm text-muted-foreground/80">Desbloqueie conquistas lendárias e aumente seu prestígio</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <BadgesGallery salespersonId={user?.id} />
            </div>
            
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 border border-primary/20 bg-primary/5 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="h-24 w-24 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-primary animate-pulse" />
                    <h3 className="font-display font-bold text-primary uppercase tracking-wider">Novo Milestone</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você está a apenas <span className="text-foreground font-bold italic">2 vendas</span> de desbloquear o badge <span className="text-primary font-bold">"Fechador Implacável"</span>.
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-coins/20 bg-coins/5 relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                  <Award className="h-24 w-24 text-coins" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-coins uppercase tracking-wider mb-2">Prestígio Lendário</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Badges lendários concedem acesso a <span className="text-coins font-medium">multiplicadores de XP</span> permanentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
