import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Flame, Trophy, Zap } from "lucide-react";
import { useLevelUpCelebration } from "@/hooks/useLevelUpCelebration";
import { LevelUpOverlay, StreakMilestoneOverlay } from "./LevelUpOverlay";
import { getLevelInfo } from "@/hooks/useSalespersonXP";

export function CelebrationTestButtons() {
  const { triggerLevelUp, triggerStreakMilestone, triggerNewRecordCelebration } = useLevelUpCelebration();
  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);
  const [showStreakOverlay, setShowStreakOverlay] = useState(false);
  const [testLevel, setTestLevel] = useState(5);
  const [testStreak, setTestStreak] = useState(10);

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
        <CardContent className="space-y-3">
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
