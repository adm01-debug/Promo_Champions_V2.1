import { useState } from "react";
import { Plug, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChannelCredentials,
  useToggleChannelCredential,
  useDeleteChannelCredential,
} from "@/hooks/multichannel/useChannelCredentials";
import { CHANNEL_LABEL, PROVIDER_LABEL } from "./multichannelHelpers";
import { ProviderConnectionDialog } from "./ProviderConnectionDialog";
import { TestSendButton } from "./TestSendButton";

export function ChannelCredentialsManager() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useChannelCredentials();
  const toggle = useToggleChannelCredential();
  const del = useDeleteChannelCredential();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          <CardTitle>Canais conectados</CardTitle>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum canal conectado. Adicione um provedor para começar a enviar WhatsApp/SMS via sequências.
          </p>
        ) : (
          <div className="space-y-2">
            {data!.map((c) => (
              <div key={c.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.label || PROVIDER_LABEL[c.provider]}</span>
                    <Badge variant="outline">{CHANNEL_LABEL[c.channel]}</Badge>
                    <Badge variant="secondary">{PROVIDER_LABEL[c.provider]}</Badge>
                  </div>
                  {c.from_number && (
                    <p className="text-xs text-muted-foreground mt-0.5">De: {c.from_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TestSendButton channel={c.channel} />
                  <Switch
                    checked={c.enabled}
                    onCheckedChange={(v) => toggle.mutate({ id: c.id, enabled: v })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <ProviderConnectionDialog open={open} onOpenChange={setOpen} />
    </Card>
  );
}
