import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Trash2, Search, Shield, AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeoStatsCards } from "./geo/GeoStatsCards";
import { GeoAccessLogs } from "./geo/GeoAccessLogs";

const COUNTRIES = [
  { code: "BR", name: "Brasil" }, { code: "US", name: "Estados Unidos" }, { code: "PT", name: "Portugal" },
  { code: "AR", name: "Argentina" }, { code: "CL", name: "Chile" }, { code: "CO", name: "Colômbia" },
  { code: "MX", name: "México" }, { code: "PE", name: "Peru" }, { code: "UY", name: "Uruguai" },
  { code: "PY", name: "Paraguai" }, { code: "EC", name: "Equador" }, { code: "VE", name: "Venezuela" },
  { code: "BO", name: "Bolívia" }, { code: "ES", name: "Espanha" }, { code: "FR", name: "França" },
  { code: "DE", name: "Alemanha" }, { code: "IT", name: "Itália" }, { code: "GB", name: "Reino Unido" },
  { code: "CA", name: "Canadá" }, { code: "JP", name: "Japão" }, { code: "CN", name: "China" },
  { code: "IN", name: "Índia" }, { code: "AU", name: "Austrália" }, { code: "NZ", name: "Nova Zelândia" },
  { code: "ZA", name: "África do Sul" }, { code: "KR", name: "Coreia do Sul" }, { code: "RU", name: "Rússia" },
  { code: "NL", name: "Holanda" }, { code: "BE", name: "Bélgica" }, { code: "CH", name: "Suíça" },
  { code: "AT", name: "Áustria" }, { code: "SE", name: "Suécia" }, { code: "NO", name: "Noruega" },
  { code: "DK", name: "Dinamarca" }, { code: "FI", name: "Finlândia" }, { code: "IE", name: "Irlanda" },
  { code: "PL", name: "Polônia" }, { code: "CZ", name: "República Tcheca" }, { code: "GR", name: "Grécia" },
  { code: "TR", name: "Turquia" }, { code: "IL", name: "Israel" }, { code: "AE", name: "Emirados Árabes" },
  { code: "SG", name: "Singapura" }, { code: "HK", name: "Hong Kong" }, { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Tailândia" }, { code: "MY", name: "Malásia" }, { code: "ID", name: "Indonésia" },
  { code: "PH", name: "Filipinas" }, { code: "VN", name: "Vietnã" },
].sort((a, b) => a.name.localeCompare(b.name));

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface AllowedCountry {
  id: string; country_code: string; country_name: string; is_active: boolean;
  blocked_at: string | null; blocked_by: string | null; reason: string | null; created_at: string;
}

export function GeoBlockingManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isWhitelistMode, setIsWhitelistMode] = useState(true);
  const queryClient = useQueryClient();

  const { data: allowedCountries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ["geo-allowed-countries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("geo_blocked_regions").select("*").order("country_name", { ascending: true });
      if (error) throw error;
      return data as AllowedCountry[];
    },
  });

  const { data: accessLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["geo-access-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("geo_access_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const addCountryMutation = useMutation({
    mutationFn: async (countryCode: string) => {
      const country = COUNTRIES.find(c => c.code === countryCode);
      if (!country) throw new Error("País não encontrado");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("geo_blocked_regions").insert({ country_code: country.code, country_name: country.name, is_active: true, blocked_by: user?.id, reason: "Adicionado à whitelist" });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["geo-allowed-countries"] }); toast.success("País adicionado à whitelist!"); setSelectedCountry(""); },
    onError: (error: Error) => { toast.error(error.message.includes("duplicate") ? "Este país já está na lista" : "Erro ao adicionar país: " + error.message); },
  });

  const removeCountryMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("geo_blocked_regions").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["geo-allowed-countries"] }); toast.success("País removido da whitelist!"); },
    onError: (error: Error) => { toast.error("Erro ao remover país: " + error.message); },
  });

  const toggleCountryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => { const { error } = await supabase.from("geo_blocked_regions").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["geo-allowed-countries"] }); toast.success("Status atualizado!"); },
    onError: (error: Error) => { toast.error("Erro ao atualizar: " + error.message); },
  });

  const activeCountries = allowedCountries?.filter(c => c.is_active) || [];
  const inactiveCountries = allowedCountries?.filter(c => !c.is_active) || [];
  const filteredCountries = allowedCountries?.filter(c => c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.country_code.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const availableCountries = COUNTRIES.filter(c => !allowedCountries?.some(ac => ac.country_code === c.code));
  const blockedAccessCount = accessLogs?.filter(log => log.blocked)?.length || 0;
  const allowedAccessCount = accessLogs?.filter(log => !log.blocked)?.length || 0;

  if (isLoadingCountries) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <GeoStatsCards activeCount={activeCountries.length} inactiveCount={inactiveCountries.length} blockedAccessCount={blockedAccessCount} allowedAccessCount={allowedAccessCount} />

      {/* Whitelist mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
              <div><CardTitle>Modo Whitelist Global</CardTitle><CardDescription>Apenas países na lista podem acessar o sistema</CardDescription></div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="whitelist-mode" className="text-sm text-muted-foreground">Whitelist Ativa</Label>
              <Switch id="whitelist-mode" checked={isWhitelistMode} onCheckedChange={setIsWhitelistMode} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isWhitelistMode ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20"><Shield className="h-5 w-5 text-success" /><span className="text-sm text-success dark:text-success">Modo Whitelist ativo: Somente países listados abaixo podem acessar o sistema.</span></div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rank-gold/10 border border-rank-gold/20"><AlertTriangle className="h-5 w-5 text-rank-gold" /><span className="text-sm text-rank-gold dark:text-rank-gold">Modo Whitelist desativado: Todos os países podem acessar o sistema.</span></div>
          )}
        </CardContent>
      </Card>

      {/* Add country */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5" />Adicionar País à Whitelist</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione um país..." /></SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2"><span className="text-lg">{getFlagEmoji(country.code)}</span>{country.name} ({country.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => selectedCountry && addCountryMutation.mutate(selectedCountry)} disabled={!selectedCountry || addCountryMutation.isPending}><Plus className="h-4 w-4 mr-2" />Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Country list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" />Países na Whitelist ({filteredCountries.length})</CardTitle>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar país..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCountries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><Globe className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhum país na whitelist</p><p className="text-sm">Adicione países para permitir acesso</p></div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredCountries.map((country) => (
                  <div key={country.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${country.is_active ? "bg-success/5 border-success/20 hover:bg-success/10" : "bg-muted/50 border-border hover:bg-muted"}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getFlagEmoji(country.country_code)}</span>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium">{country.country_name}</span><Badge variant="outline" className="text-xs">{country.country_code}</Badge></div>
                        <p className="text-xs text-muted-foreground">Adicionado em {new Date(country.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={country.is_active} onCheckedChange={(checked) => toggleCountryMutation.mutate({ id: country.id, isActive: checked })} />
                        <Badge variant={country.is_active ? "default" : "secondary"}>{country.is_active ? "Ativo" : "Inativo"}</Badge>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Remover região" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Remover país?</AlertDialogTitle><AlertDialogDescription>Isso removerá <strong>{country.country_name}</strong> da whitelist. Usuários deste país não poderão mais acessar o sistema.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => removeCountryMutation.mutate(country.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <GeoAccessLogs accessLogs={accessLogs} isLoading={isLoadingLogs} />
    </div>
  );
}
