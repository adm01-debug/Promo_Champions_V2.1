import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRewardsMarketplace, useRedeemReward } from '@/hooks/useRewardsMarketplace';
import { Gift, Zap, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const categoryIcons = {
  physical: '📦',
  digital: '💻',
  experience: '🌟',
  benefit: '🎁',
};

const categoryLabels = {
  physical: 'Físico',
  digital: 'Digital',
  experience: 'Experiência',
  benefit: 'Benefício',
};

export const RewardsMarketplaceCard: FC = () => {
  const { data, isLoading, error } = useRewardsMarketplace();
  const redeemMutation = useRedeemReward();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplace de Recompensas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplace de Recompensas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar marketplace</p>
        </CardContent>
      </Card>
    );
  }

  const filteredRewards = selectedCategory
    ? data.rewards.filter(r => r.category === selectedCategory)
    : data.rewards;

  const nextLevelXP = data.userXP.level * 1000;
  const levelProgress = ((data.userXP.total % 1000) / 1000) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Marketplace de Recompensas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Status */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">Nível {data.userXP.level}</span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {data.userXP.available} XP disponível
            </Badge>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {1000 - (data.userXP.total % 1000)} XP para o próximo nível
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {categoryIcons[key as keyof typeof categoryIcons]} {label}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid gap-3 max-h-[300px] overflow-y-auto">
          {filteredRewards.map((reward) => {
            const canAfford = data.userXP.available >= reward.xpCost;
            
            return (
              <div
                key={reward.id}
                className={`p-3 rounded-lg border ${
                  canAfford ? 'bg-card hover:bg-muted/50' : 'bg-muted/30 opacity-60'
                } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[reward.category]}</span>
                      <p className="font-medium text-sm">{reward.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3" />
                      {reward.xpCost}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {reward.stock} disponíveis
                    </p>
                  </div>
                </div>
                {canAfford && reward.available && (
                  <Button
                    size="sm"
                    className="w-full mt-2 gap-1"
                    onClick={() => redeemMutation.mutate({ rewardId: reward.id, xpCost: reward.xpCost })}
                    disabled={redeemMutation.isPending}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Resgatar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
