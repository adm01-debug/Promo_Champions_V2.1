import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Flame, Trophy, Zap, Loader2, Database } from "lucide-react";
import { useLevelUpCelebration } from "@/hooks/gamification/useLevelUpCelebration";
import { LevelUpOverlay, StreakMilestoneOverlay } from "./LevelUpOverlay";
import { getLevelInfo, useAddXP } from "@/hooks/gamification/useSalespersonXP";
import { useGamificationData } from "@/hooks/gamification/useGamificationData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function CelebrationTestButtons() {
  const { triggerLevelUp, triggerStreakMilestone, triggerNewRecordCelebration } = useLevelUpCelebration();
  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);
  const [showStreakOverlay, setShowStreakOverlay] = useState(false);
  const [testLevel, setTestLevel] = useState(5);
  const [testStreak, setTestStreak] = useState(10);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("");
  const [xpAmount, setXpAmount] = useState(50);

  const { data: salespeople, isLoading: loadingSalespeople } = useGamificationData();
  const addXPMutation = useAddXP();

  const levelInfo = getLevelInfo(testLevel);

  const handleTestLevelUp = () => {
    setShowLevelUpOverlay(true);
    triggerLevelUp({
      salespersonId: 'test-id',
      salespersonName: 'Vendedor Teste',
      newLevel: testLevel,
      levelTitle: levelInfo.title,
      levelEmoji: levelInfo.emoji,
    });
  };

  const handleTestStreakMilestone = () => {
    setShowStreakOverlay(true);
    triggerStreakMilestone({
      salespersonId: 'test-id',
      salespersonName: 'Vendedor Teste',
      streakDays: testStreak,
    });
  };

  const handleTestNewRecord = () => {
    triggerNewRecordCelebration('Vendedor Teste', 15);
  };

  const handleAddRealXP = async () => {
    if (!selectedSalesperson) {
      toast.error("Selecione um vendedor primeiro");
      return;
    }

    const salesperson = salespeople?.find(s => s.salesperson_id === selectedSalesperson);
    if (!salesperson) return;

    try {
      await addXPMutation.mutateAsync({
        salespersonId: selectedSalesperson,
        xpAmount: xpAmount,
        sourceType: 'test',
        description: 'XP de teste para celebração',
      });
      toast.success(`+${xpAmount} XP adicionado para ${salesperson.name}!`);
    } catch (error) {
      toast.error("Erro ao adicionar XP");
    }
  };

  return (
    <>
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Testar Celebrações
          </CardTitle>
          <CardDescription className="text-xs">
            Teste as animações de celebração do sistema de gamificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulação Local (sem banco) */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Simulação Local</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestLevelUp}
                className="flex items-center gap-2 hover-glow"
              >
                <Zap className="h-4 w-4 text-xp" />
                Level Up (Nv.{testLevel})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestStreakMilestone}
                className="flex items-center gap-2 hover-glow"
              >
                <Flame className="h-4 w-4 text-streak" />
                Streak ({testStreak} dias)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNewRecord}
                className="flex items-center gap-2 hover-glow-gold"
              >
                <Trophy className="h-4 w-4 text-coins" />
                Novo Recorde
              </Button>
            </div>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <button 
                onClick={() => setTestLevel(prev => Math.max(1, prev - 1))}
                className="px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                Nv -
              </button>
              <button 
                onClick={() => setTestLevel(prev => Math.min(20, prev + 1))}
                className="px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                Nv +
              </button>
              <span className="px-2">|</span>
              <button 
                onClick={() => setTestStreak(prev => Math.max(5, prev - 5))}
                className="px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                Streak -5
              </button>
              <button 
                onClick={() => setTestStreak(prev => prev + 5)}
                className="px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                Streak +5
              </button>
            </div>
          </div>

          {/* Teste Real-time (com banco) */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Database className="h-3 w-3" />
              Teste em Tempo Real (atualiza banco)
            </p>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={selectedSalesperson}
                onValueChange={setSelectedSalesperson}
                disabled={loadingSalespeople}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Selecione vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople?.map((sp) => (
                    <SelectItem key={sp.salesperson_id} value={sp.salesperson_id} className="text-xs">
                      {sp.name} (Nv.{sp.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={xpAmount.toString()}
                onValueChange={(v) => setXpAmount(Number(v))}
              >
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">+25 XP</SelectItem>
                  <SelectItem value="50">+50 XP</SelectItem>
                  <SelectItem value="100">+100 XP</SelectItem>
                  <SelectItem value="250">+250 XP</SelectItem>
                  <SelectItem value="500">+500 XP</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={handleAddRealXP}
                disabled={!selectedSalesperson || addXPMutation.isPending}
                className="flex items-center gap-2 bg-gradient-primary hover:opacity-90"
              >
                {addXPMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Adicionar XP
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground/70">
              Ao adicionar XP, o overlay de celebração aparecerá automaticamente se houver level-up
            </p>
          </div>
        </CardContent>
      </Card>

      <LevelUpOverlay
        isVisible={showLevelUpOverlay}
        level={testLevel}
        levelTitle={levelInfo.title}
        levelEmoji={levelInfo.emoji}
        salespersonName="Vendedor Teste"
        onComplete={() => setShowLevelUpOverlay(false)}
      />

      <StreakMilestoneOverlay
        isVisible={showStreakOverlay}
        streakDays={testStreak}
        salespersonName="Vendedor Teste"
        onComplete={() => setShowStreakOverlay(false)}
      />
    </>
  );
}