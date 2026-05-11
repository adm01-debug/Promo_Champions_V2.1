import { useState, useEffect } from "react";
import { useICPConfig, useUpdateICPConfig } from "@/hooks/useICPConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, Plus, X, Save, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ICPConfigForm() {
  const { data: config, isLoading } = useICPConfig();
  const updateConfig = useUpdateICPConfig();
  
  const [industries, setIndustries] = useState<string[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [minCapital, setMinCapital] = useState("");
  const [minEmployees, setMinEmployees] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newNiche, setNewNiche] = useState("");

  useEffect(() => {
    if (config) {
      setIndustries(config.target_industries || []);
      setNiches(config.preferred_niches || []);
      setMinCapital(config.min_capital?.toString() || "");
      setMinEmployees(config.min_employees?.toString() || "");
    }
  }, [config]);

  const handleAddIndustry = () => {
    if (newIndustry && !industries.includes(newIndustry)) {
      setIndustries([...industries, newIndustry]);
      setNewIndustry("");
    }
  };

  const handleRemoveIndustry = (ind: string) => {
    setIndustries(industries.filter((i) => i !== ind));
  };

  const handleAddNiche = () => {
    if (newNiche && !niches.includes(newNiche)) {
      setNiches([...niches, newNiche]);
      setNewNiche("");
    }
  };

  const handleRemoveNiche = (nic: string) => {
    setNiches(niches.filter((n) => n !== nic));
  };

  const handleSave = async () => {
    await updateConfig.mutateAsync({
      target_industries: industries,
      preferred_niches: niches,
      min_capital: parseFloat(minCapital) || 0,
      min_employees: parseInt(minEmployees) || 0,
    });
  };

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Configuração de Perfil Ideal (ICP)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">
                Ramos de Atividade Alvo
              </Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ex: Tecnologia"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddIndustry()}
                />
                <Button size="icon" variant="outline" onClick={handleAddIndustry}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="pl-2 pr-1 py-1 gap-1 group">
                    {ind}
                    <button onClick={() => handleRemoveIndustry(ind)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">
                Nichos Preferenciais
              </Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ex: SaaS"
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNiche()}
                />
                <Button size="icon" variant="outline" onClick={handleAddNiche}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {niches.map((nic) => (
                  <Badge key={nic} variant="outline" className="pl-2 pr-1 py-1 gap-1 border-primary/30 text-primary">
                    {nic}
                    <button onClick={() => handleRemoveNiche(nic)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min_capital" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Capital Social Mínimo (R$)
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min_capital"
                  type="number"
                  className="pl-9"
                  value={minCapital}
                  onChange={(e) => setMinCapital(e.target.value)}
                  placeholder="Ex: 500000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_employees" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Nº Mínimo de Colaboradores
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min_employees"
                  type="number"
                  className="pl-9"
                  value={minEmployees}
                  onChange={(e) => setMinEmployees(e.target.value)}
                  placeholder="Ex: 50"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={updateConfig.isPending}
                className="w-full gap-2 shadow-lg shadow-primary/20"
              >
                <Save className="h-4 w-4" />
                Salvar Parâmetros ICP
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                * A atualização aplicará automaticamente o novo score a todos os clientes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
