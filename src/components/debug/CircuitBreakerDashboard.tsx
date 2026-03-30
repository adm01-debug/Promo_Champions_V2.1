import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAllCircuitStates, resetCircuit, resetAllCircuits } from '@/hooks/useCircuitBreaker';
import { useCircuitBreakerHistory } from '@/hooks/useCircuitBreakerHistory';
import { cn } from '@/lib/utils';

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailure: number | null;
  halfOpenAttempts: number;
}

export const CircuitBreakerDashboard: FC = () => {
  const [circuits, setCircuits] = useState<Record<string, CircuitState>>({});
  const { data: history, isLoading: _historyLoading } = useCircuitBreakerHistory();

  useEffect(() => {
    const interval = setInterval(() => {
      setCircuits(getAllCircuitStates());
    }, 1000);
    
    setCircuits(getAllCircuitStates());
    return () => clearInterval(interval);
  }, []);

  const handleResetCircuit = (name: string) => {
    resetCircuit(name);
    setCircuits(getAllCircuitStates());
  };

  const handleResetAll = () => {
    resetAllCircuits();
    setCircuits(getAllCircuitStates());
  };

  const getStateColor = (state: CircuitState['state']) => {
    switch (state) {
      case 'CLOSED':
        return 'bg-emerald-500';
      case 'OPEN':
        return 'bg-red-500';
      case 'HALF_OPEN':
        return 'bg-amber-500';
    }
  };

  const getStateIcon = (state: CircuitState['state']) => {
    switch (state) {
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'HALF_OPEN':
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const circuitEntries = Object.entries(circuits);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Circuit Breakers
        </CardTitle>
        {circuitEntries.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {circuitEntries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum circuit breaker ativo no momento
          </p>
        ) : (
          <div className="space-y-4">
            {circuitEntries.map(([name, circuit]) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Badge className={cn('gap-1', getStateColor(circuit.state))}>
                    {getStateIcon(circuit.state)}
                    {circuit.state}
                  </Badge>
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      Failures: {circuit.failures} | Half-open attempts: {circuit.halfOpenAttempts}
                    </p>
                  </div>
                </div>
                {circuit.state !== 'CLOSED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetCircuit(name)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Histórico Recente</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.circuit_name}
                    </Badge>
                    <span>{event.event_type}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
