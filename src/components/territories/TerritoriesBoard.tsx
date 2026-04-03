import { useTerritories, useTerritoryHistory, Territory } from '@/hooks/useTerritories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Crown, Swords, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TerritoriesBoard() {
  const { data: territories = [], isLoading } = useTerritories();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data: history = [] } = useTerritoryHistory(selectedId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    region: <MapPin className="h-4 w-4" />,
    product: <Trophy className="h-4 w-4" />,
    segment: <Users className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Territory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {territories.map((territory) => (
          <TerritoryCard
            key={territory.id}
            territory={territory}
            isSelected={selectedId === territory.id}
            onClick={() => setSelectedId(selectedId === territory.id ? undefined : territory.id)}
            icon={typeIcons[territory.territory_type] || typeIcons.region}
          />
        ))}
      </div>

      {territories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum território cadastrado.</p>
        </div>
      )}

      {/* History Panel */}
      {selectedId && history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Histórico do Território
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{h.salesperson?.name || 'Desconhecido'}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{h.deals_count} deals</span>
                        <span>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(h.revenue_contribution)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {h.conquered_at && (
                        <div>Conquistou: {format(new Date(h.conquered_at), 'dd/MM/yy', { locale: ptBR })}</div>
                      )}
                      {h.lost_at && (
                        <div className="text-destructive">Perdeu: {format(new Date(h.lost_at), 'dd/MM/yy', { locale: ptBR })}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TerritoryCard({
  territory,
  isSelected,
  onClick,
  icon,
}: {
  territory: Territory;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary/50' : ''
      } ${territory.is_contested ? 'border-destructive/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
              <h3 className="font-medium text-sm">{territory.territory_name}</h3>
              <Badge variant="outline" className="text-xs mt-0.5">
                {territory.territory_type}
              </Badge>
            </div>
          </div>
          {territory.is_contested && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
              <Swords className="h-3 w-3" />
              Disputado
            </Badge>
          )}
        </div>

        {/* Owner */}
        {territory.owner ? (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={territory.owner.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {territory.owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{territory.owner.name}</span>
            <Crown className="h-3 w-3 text-primary ml-auto" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-3 italic">Sem dono atual</p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Deals</p>
            <p className="font-bold text-sm">{territory.total_deals}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="font-bold text-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(territory.total_revenue)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
