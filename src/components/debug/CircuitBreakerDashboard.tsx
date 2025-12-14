import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  getAllCircuitStates, 
  resetCircuit, 
  resetAllCircuits 
} from '@/hooks/useCircuitBreaker';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion,
  RefreshCw,
  RotateCcw,
  Activity,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailure: number | null;
  halfOpenAttempts: number;
}

export function CircuitBreakerDashboard() {
  const [circuits, setCircuits] = useState<Record<string, CircuitState>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStates = useCallback(() => {
    setIsRefreshing(true);
    const states = getAllCircuitStates();
    setCircuits(states);
    setTimeout(() => setIsRefreshing(false), 300);
  }, []);

  useEffect(() => {
    refreshStates();
    const interval = setInterval(refreshStates, 2000); // Refresh every 2s
    return () => clearInterval(interval);
  }, [refreshStates]);

  const handleResetCircuit = (name: string) => {
    resetCircuit(name);
    refreshStates();
    toast.success(`Circuit "${name}" resetado`);
  };

  const handleResetAll = () => {
    resetAllCircuits();
    refreshStates();
    toast.success('Todos os circuits resetados');
  };

  const circuitEntries = Object.entries(circuits);
  const openCount = circuitEntries.filter(([_, c]) => c.state === 'OPEN').length;
  const halfOpenCount = circuitEntries.filter(([_, c]) => c.state === 'HALF_OPEN').length;
  const closedCount = circuitEntries.filter(([_, c]) => c.state === 'CLOSED').length;

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return <ShieldCheck className="h-5 w-5 text-status-success" />;
      case 'OPEN':
        return <ShieldAlert className="h-5 w-5 text-status-error" />;
      case 'HALF_OPEN':
        return <ShieldQuestion className="h-5 w-5 text-status-warning" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return <Badge className="bg-status-success/20 text-status-success border-status-success/30">Fechado</Badge>;
      case 'OPEN':
        return <Badge className="bg-status-error/20 text-status-error border-status-error/30">Aberto</Badge>;
      case 'HALF_OPEN':
        return <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Semi-Aberto</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatTimeSince = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Circuits</p>
                <p className="text-2xl font-display font-bold">{circuitEntries.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saudáveis</p>
                <p className="text-2xl font-display font-bold text-status-success">{closedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Recuperação</p>
                <p className="text-2xl font-display font-bold text-status-warning">{halfOpenCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <ShieldQuestion className="h-5 w-5 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
                <p className="text-2xl font-display font-bold text-status-error">{openCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-status-error/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-status-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold">Circuit Breakers</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStates}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetAll}
            disabled={circuitEntries.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar Todos
          </Button>
        </div>
      </div>

      {/* Circuit List */}
      {circuitEntries.length === 0 ? (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Nenhum circuit breaker registrado ainda.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Circuits são criados automaticamente quando mutations são executadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {circuitEntries.map(([name, circuit]) => (
            <Card 
              key={name} 
              className={`border-border/40 transition-all hover-lift ${
                circuit.state === 'OPEN' ? 'border-status-error/50 bg-status-error/5' :
                circuit.state === 'HALF_OPEN' ? 'border-status-warning/50 bg-status-warning/5' :
                'bg-card/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getStateIcon(circuit.state)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium font-display">{name}</span>
                        {getStateBadge(circuit.state)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {circuit.failures} falhas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeSince(circuit.lastFailure)}
                        </span>
                        {circuit.state === 'HALF_OPEN' && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {circuit.halfOpenAttempts} tentativas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Failure Progress */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Limiar</span>
                        <span>{circuit.failures}/5</span>
                      </div>
                      <Progress 
                        value={(circuit.failures / 5) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetCircuit(name)}
                    className="ml-4"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card className="border-border/40 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Legenda de Estados</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-status-success mt-0.5" />
              <div>
                <span className="font-medium">Fechado (CLOSED)</span>
                <p className="text-muted-foreground text-xs">
                  Operação normal. Requisições passam normalmente.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldQuestion className="h-4 w-4 text-status-warning mt-0.5" />
              <div>
                <span className="font-medium">Semi-Aberto (HALF_OPEN)</span>
                <p className="text-muted-foreground text-xs">
                  Testando recuperação. Algumas requisições passam.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-status-error mt-0.5" />
              <div>
                <span className="font-medium">Aberto (OPEN)</span>
                <p className="text-muted-foreground text-xs">
                  Bloqueado. Requisições rejeitadas imediatamente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
