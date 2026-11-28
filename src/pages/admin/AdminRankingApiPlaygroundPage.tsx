import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Copy, KeyRound, Loader2, Play, TriangleAlert } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  RANKING_API_ROUTES,
  buildCurlSnippet,
  buildRequestUrl,
  missingPathParams,
  type RankingApiField,
  type RankingApiRoute,
} from '@/hooks/admin/rankingApiCatalog';
import {
  callRankingApi,
  describeStatus,
  resolveRoutePath,
  type RankingApiCallResult,
} from '@/hooks/admin/rankingApiPlayground';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';

function valuesForRoute(route: RankingApiRoute, current: Record<string, string>) {
  const next: Record<string, string> = {};
  for (const field of [...(route.pathFields ?? []), ...(route.bodyFields ?? [])]) {
    next[field.name] = current[field.name] ?? field.defaultValue ?? '';
  }
  return next;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: RankingApiField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.kind === 'select' ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={`field-${field.name}`}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={`field-${field.name}`}
          type={
            field.kind === 'number' ? 'number' : field.kind === 'email' ? 'email' : 'text'
          }
          value={value}
          placeholder={field.placeholder}
          onChange={event => onChange(event.target.value)}
        />
      )}
      {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
    </div>
  );
}

function StatusBadge({ result }: { result: RankingApiCallResult }) {
  const variant = result.ok
    ? 'success'
    : result.status === 429
      ? 'warning'
      : 'destructive';
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant={variant}>{result.status}</Badge>
      <span className="text-sm text-muted-foreground">
        {describeStatus(result.status)}
      </span>
      <span className="text-xs text-muted-foreground">{result.durationMs} ms</span>
    </div>
  );
}

function RankingApiPlaygroundContent() {
  const [token, setToken] = useState('');
  const [routeIndex, setRouteIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() =>
    valuesForRoute(RANKING_API_ROUTES[0], {})
  );
  const [result, setResult] = useState<RankingApiCallResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const route = RANKING_API_ROUTES[routeIndex];
  const path = resolveRoutePath(route, values);
  const url = buildRequestUrl(SUPABASE_URL, route.method, path);
  const missing = missingPathParams(route, values);
  const hasBody = route.method === 'POST' || route.method === 'PUT';

  const snippet = useMemo(() => {
    const body = hasBody
      ? Object.fromEntries(
          (route.bodyFields ?? [])
            .map(field => [field.name, values[field.name] ?? ''] as const)
            .filter(([, value]) => value.trim() !== '')
        )
      : null;
    return buildCurlSnippet(url, route.method, token, body);
  }, [hasBody, route, url, token, values]);

  const selectRoute = (index: number) => {
    setRouteIndex(index);
    setValues(valuesForRoute(RANKING_API_ROUTES[index], values));
    setResult(null);
    setError(null);
  };

  const setValue = (name: string, value: string) =>
    setValues(current => ({ ...current, [name]: value }));

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copiado` });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const send = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Informe o token da API para executar a chamada.');
      return;
    }
    if (missing.length > 0) {
      setError(`Preencha: ${missing.join(', ')}.`);
      return;
    }
    setError(null);
    setSending(true);
    try {
      const response = await callRankingApi({
        supabaseUrl: SUPABASE_URL,
        method: route.method,
        path,
        token: trimmed,
        route,
        values,
      });
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof Error
          ? `Falha de rede ao chamar a API: ${err.message}`
          : 'Falha de rede ao chamar a API.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Playground da API de Ranking | Promo Champions</title>
        <meta
          name="description"
          content="Execute qualquer rota da ranking-api com um token real e veja a resposta que o integrador recebe."
        />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-page-title gradient-text">
              Playground da API de Ranking
            </h1>
            <p className="text-muted-foreground mt-1">
              Testa as rota de <code>/functions/v1/ranking-api/v2</code> com o token do
              integrador. O token não é gravado — fica só nesta aba do navegador.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Requisição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ranking-api-route">Rota</Label>
                <Select
                  value={String(routeIndex)}
                  onValueChange={v => selectRoute(Number(v))}
                >
                  <SelectTrigger id="ranking-api-route">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RANKING_API_ROUTES.map((item, index) => (
                      <SelectItem
                        key={`${item.method}-${item.path}`}
                        value={String(index)}
                      >
                        {item.method} {item.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{route.description}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ranking-api-token">Token da API</Label>
                <Input
                  id="ranking-api-token"
                  type="password"
                  autoComplete="off"
                  value={token}
                  placeholder="token emitido para o integrador"
                  onChange={event => setToken(event.target.value)}
                />
                {route.requiresTeam ? (
                  <p className="text-xs text-muted-foreground">
                    Esta rota exige token vinculado a um time; token de empresa devolve
                    400.
                  </p>
                ) : null}
              </div>
            </div>

            {(route.pathFields ?? []).length > 0 ||
            (route.bodyFields ?? []).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...(route.pathFields ?? []), ...(route.bodyFields ?? [])].map(field => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    value={values[field.name] ?? ''}
                    onChange={value => setValue(field.name, value)}
                  />
                ))}
              </div>
            ) : null}

            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <code className="text-xs break-all">
                  {route.method} {url}
                </code>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copy(url, 'URL')}>
                    <Copy className="h-4 w-4 mr-1" /> URL
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copy(snippet, 'curl')}>
                    <Copy className="h-4 w-4 mr-1" /> curl
                  </Button>
                  <Button size="sm" onClick={send} disabled={sending}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Executar
                  </Button>
                </div>
              </div>
              {hasBody ? (
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(
                    Object.fromEntries(
                      (route.bodyFields ?? [])
                        .map(field => [field.name, values[field.name] ?? ''] as const)
                        .filter(([, value]) => value.trim() !== '')
                    ),
                    null,
                    2
                  )}
                </pre>
              ) : null}
            </div>

            {route.method === 'PUT' ? (
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                Rotas PUT alteram pontuação de verdade e ficam registradas no histórico.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Resposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : !result ? (
              <p className="text-sm text-muted-foreground">
                Informe o token e clique em Executar para ver a resposta da API.
              </p>
            ) : (
              <>
                <StatusBadge result={result} />
                <Textarea
                  readOnly
                  className="min-h-[220px] font-mono text-xs"
                  value={JSON.stringify(result.body, null, 2)}
                  aria-label="Corpo da resposta"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function AdminRankingApiPlaygroundPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <RankingApiPlaygroundContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
