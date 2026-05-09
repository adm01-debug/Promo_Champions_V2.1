import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { useGamifiedProfile } from "@/hooks/useGamifiedProfile";
import { BadgesGallery } from "@/components/competitive/BadgesGallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Target, Swords, Heart, Crown, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GamifiedProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useGamifiedProfile(user?.id);

  if (isLoading) return <div className="p-8 animate-pulse space-y-4"><div className="h-40 bg-muted rounded-xl" /><div className="h-80 bg-muted rounded-xl" /></div>;

  return (
    <>
      <Helmet>
        <title>Perfil Gamer | Promo Champions</title>
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="h-40 w-40 text-primary rotate-12" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl shadow-primary/20 ring-4 ring-primary/10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl font-bold bg-primary/20">{profile?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-rank-gold to-coins p-2 rounded-xl shadow-lg border border-white/20">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-display font-bold gradient-text">{profile?.name}</h1>
                  <Badge variant="glow" className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest px-3">
                    LVL {Math.floor((profile?.totalXp || 0) / 1000) + 1}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                  <Crown className="h-4 w-4 text-rank-gold" />
                  {profile?.role || 'Vendedor Elite'} • {profile?.league || 'Liga Bronze'}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent animate-pulse" />
                    <span className="text-xl font-bold font-display">{profile?.totalXp} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-status-error" />
                    <span className="text-xl font-bold font-display">{profile?.currentStreak}d Streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-rank-gold" />
                    <span className="text-xl font-bold font-display">Rank #{profile?.rank}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10 max-w-2xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground font-semibold">Próximo Nível</span>
                <span className="text-primary font-bold">{(profile?.totalXp || 0) % 1000} / 1000 XP</span>
              </div>
              <Progress value={(profile?.totalXp || 0) % 100} className="h-3 bg-primary/10" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card className="glass border-border/40 overflow-hidden group">
                <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Atributos de Combate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {[
                    { label: 'Volume de Vendas', value: `R$ ${(profile?.totalSales || 0) / 1000}k`, icon: Award, color: 'text-primary' },
                    { label: 'Taxa de Win (H2H)', value: `${profile?.h2hWins} - ${profile?.h2hLosses}`, icon: Swords, color: 'text-status-error' },
                    { label: 'Kudos Recebidos', value: profile?.kudosReceived, icon: Heart, color: 'text-pink-500' },
                    { label: 'Maior Streak', value: `${profile?.longestStreak} dias`, icon: Flame, color: 'text-orange-500' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30 group-hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border-border/40 bg-gradient-to-br from-coins/10 to-transparent">
                <CardHeader>
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Award className="h-4 w-4 text-coins" />
                    Elite Showcase
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 w-16 rounded-2xl border-2 border-dashed border-coins/30 flex items-center justify-center bg-coins/5 group cursor-pointer hover:border-coins/60 transition-all">
                      <Plus className="h-6 w-6 text-coins/40 group-hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content: Badges */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-display font-bold gradient-text">Galeria de Conquistas</h2>
                </div>
                <Badge variant="outline" className="glass border-primary/30 text-primary">
                  {profile?.badgeCount} Desbloqueadas
                </Badge>
              </div>
              
              <BadgesGallery salespersonId={user?.id} />
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
