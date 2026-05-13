import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Shield,
  ShieldCheck,
  Trash2,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface KnownDevice {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  is_trusted: boolean | null;
}

export const KnownDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<KnownDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("known_devices")
        .select("*")
        .eq("user_id", user.id)
        .order("last_seen_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching devices:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const toggleTrust = async (deviceId: string, currentTrust: boolean) => {
    try {
      const { error } = await supabase
        .from("known_devices")
        .update({ is_trusted: !currentTrust })
        .eq("id", deviceId);

      if (error) throw error;

      toast.success(currentTrust ? "Dispositivo removido dos confiáveis" : "Dispositivo marcado como confiável");
      fetchDevices();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error updating device:", error);
      }
      toast.error("Erro ao atualizar dispositivo");
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from("known_devices")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;

      toast.success("Dispositivo removido");
      fetchDevices();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error removing device:", error);
      }
      toast.error("Erro ao remover dispositivo");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Dispositivos Conhecidos</CardTitle>
          </div>
          <CardDescription>
            Gerencie os dispositivos que acessaram sua conta. Você receberá um email quando um novo dispositivo for detectado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Proteção Ativa</AlertTitle>
            <AlertDescription>
              Você será notificado por email sempre que um login ocorrer de um novo dispositivo ou localização.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {device.os?.toLowerCase().includes('android') || device.os?.toLowerCase().includes('ios') ? (
                      <Smartphone className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {device.device_name || `${device.browser} em ${device.os}`}
                      </p>
                      {device.is_trusted && (
                        <Badge variant="default" className="text-xs bg-success">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Confiável
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {device.ip_address && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {device.ip_address}
                        </span>
                      )}
                      {device.location && (
                        <span>{device.location}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Primeiro acesso: {device.first_seen_at ? formatDistanceToNow(new Date(device.first_seen_at), { addSuffix: true, locale: ptBR }) : 'N/A'}
                      </span>
                      <span>
                        Último acesso: {device.last_seen_at ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true, locale: ptBR }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={device.is_trusted ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleTrust(device.id, !!device.is_trusted)}
                  >
                    {device.is_trusted ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDevice(device.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Alert>
          <Monitor className="h-4 w-4" />
          <AlertTitle>Nenhum dispositivo registrado</AlertTitle>
          <AlertDescription>
            Dispositivos serão registrados automaticamente quando você fizer login.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
