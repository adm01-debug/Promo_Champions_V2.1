import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Loader2, Search, Settings, Shield, Swords } from 'lucide-react';
import { useCompetitorMarketIntel } from '@/hooks/conversational/useCompetitorsRegistry';

/**
 * Market Intel da Arena: mostra apenas dados reais de concorrentes
 * (competitors_registry + competitor_mentions + battle cards em
 * sales_enablement_assets). Sem matriz/roadmap fixos no código.
 */
export const FeatureComparison = () => {
  const { data: competitors, isLoading, isError, refetch } = useCompetitorMarketIntel();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-2">
            Market Intel
          </Badge>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase gradient-text leading-none">
            Concorrentes no radar
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Concorrentes cadastrados, citações nas calls gravadas e battle cards
            vinculados.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 h-10 px-4 text-xs font-bold uppercase tracking-widest"
        >
          <Link to="/conversational-intelligence">
            <Settings className="h-4 w-4" /> Gerenciar concorrentes
          </Link>
        </Button>
      </div>

      <Card className="glass border-white/5 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <CardTitle className="text-section-title flex items-center gap-2 italic uppercase font-black tracking-tighter">
            <Swords className="h-5 w-5 text-primary" /> Concorrentes ativos
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Menções contadas nas gravações de call que você pode acessar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando concorrentes…
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-destructive">
                Não foi possível carregar os concorrentes.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : !competitors || competitors.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold">Nenhum concorrente cadastrado</p>
              <p className="text-xs text-muted-foreground max-w-md">
                Cadastre concorrentes em Inteligência Conversacional para acompanhar
                quantas vezes são citados nas calls e qual battle card usar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 px-6">
                    Concorrente
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4">
                    Apelidos
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 text-right">
                    Menções em calls
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 px-6">
                    Battle card
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map(item => (
                  <TableRow key={item.id} className="hover:bg-white/5 border-white/5">
                    <TableCell className="font-bold text-sm px-6 py-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4">
                      {item.aliases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.aliases.map(alias => (
                            <Badge
                              key={alias}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {alias}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold tabular-nums">
                      {item.mentions}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {item.battleCard ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{item.battleCard.title}</span>
                          {item.battleCard.file_url && (
                            <a
                              href={item.battleCard.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Abrir battle card ${item.battleCard.title}`}
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem battle card
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
