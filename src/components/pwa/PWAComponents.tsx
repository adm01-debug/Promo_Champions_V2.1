import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  QrCode, 
  Download, 
  Bell, 
  Settings,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface MobileAppPromoProps {
  appName: string;
  description: string;
  downloadUrl?: string;
  qrCodeUrl?: string;
}

export const MobileAppPromo: FC<MobileAppPromoProps> = ({
  appName,
  description,
  downloadUrl,
  qrCodeUrl
}) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="flex items-start gap-6">
        <div className="p-4 rounded-2xl bg-primary/20">
          <Smartphone className="h-12 w-12 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{appName}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          
          <div className="flex gap-3">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              App Store
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Google Play
            </Button>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="hidden md:block p-4 bg-white rounded-lg">
            <QrCode className="h-24 w-24 text-foreground" />
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Escaneie para baixar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

interface OfflineIndicatorProps {
  isOnline: boolean;
  lastSyncAt?: string;
  pendingChanges?: number;
  onSync?: () => void;
}

export const OfflineIndicator: FC<OfflineIndicatorProps> = ({
  isOnline,
  lastSyncAt,
  pendingChanges = 0,
  onSync
}) => {
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg
      ${isOnline ? 'bg-green-500/10' : 'bg-yellow-500/10'}
    `}>
      {isOnline ? (
        <Wifi className="h-5 w-5 text-green-500" />
      ) : (
        <WifiOff className="h-5 w-5 text-yellow-500" />
      )}
      
      <div className="flex-1">
        <p className="font-medium text-sm">
          {isOnline ? 'Online' : 'Offline'}
        </p>
        {lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Última sincronização: {lastSyncAt}
          </p>
        )}
      </div>

      {pendingChanges > 0 && (
        <Badge variant="secondary">
          {pendingChanges} alterações pendentes
        </Badge>
      )}

      {isOnline && pendingChanges > 0 && (
        <Button size="sm" variant="outline" onClick={onSync}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Sincronizar
        </Button>
      )}
    </div>
  );
};

interface PushNotificationSetupProps {
  isEnabled: boolean;
  categories: {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }[];
  onToggleCategory?: (categoryId: string, enabled: boolean) => void;
  onEnableAll?: () => void;
}

export const PushNotificationSetup: FC<PushNotificationSetupProps> = ({
  isEnabled,
  categories,
  onToggleCategory,
  onEnableAll
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">Notificações Push</h4>
          <p className="text-sm text-muted-foreground">
            Configure quais notificações deseja receber
          </p>
        </div>
        {!isEnabled && (
          <Button onClick={onEnableAll}>
            Ativar Notificações
          </Button>
        )}
      </div>

      {isEnabled && (
        <div className="space-y-3">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <input
                type="checkbox"
                checked={category.enabled}
                onChange={(e) => onToggleCategory?.(category.id, e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

interface DeviceListProps {
  devices: {
    id: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop';
    lastActive: string;
    isCurrent: boolean;
  }[];
  onRemoveDevice?: (deviceId: string) => void;
}

export const DeviceList: FC<DeviceListProps> = ({ devices, onRemoveDevice }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Dispositivos Conectados</h4>
      </div>

      <div className="space-y-3">
        {devices.map((device) => (
          <div 
            key={device.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{device.name}</p>
                  {device.isCurrent && (
                    <Badge variant="secondary" className="text-xs">Este dispositivo</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Último acesso: {device.lastActive}
                </p>
              </div>
            </div>
            {!device.isCurrent && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500"
                onClick={() => onRemoveDevice?.(device.id)}
              >
                Remover
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
