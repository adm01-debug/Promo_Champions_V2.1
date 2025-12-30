import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSettings {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dealAlerts: boolean;
  taskReminders: boolean;
  goalUpdates: boolean;
  teamActivity: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  animationsEnabled: boolean;
}

interface SettingsPanelProps {
  profile?: ProfileSettings;
  notifications?: NotificationSettings;
  appearance?: AppearanceSettings;
  onSaveProfile?: (profile: ProfileSettings) => void;
  onSaveNotifications?: (notifications: NotificationSettings) => void;
  onSaveAppearance?: (appearance: AppearanceSettings) => void;
  className?: string;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({
  profile: initialProfile,
  notifications: initialNotifications,
  appearance: initialAppearance,
  onSaveProfile,
  onSaveNotifications,
  onSaveAppearance,
  className,
}) => {
  const [profile, setProfile] = useState<ProfileSettings>(initialProfile || {
    name: '',
    email: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications || {
    emailNotifications: true,
    pushNotifications: true,
    dealAlerts: true,
    taskReminders: true,
    goalUpdates: true,
    teamActivity: false,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance || {
    theme: 'system',
    compactMode: false,
    animationsEnabled: true,
  });

  return (
    <Tabs defaultValue="profile" className={cn('', className)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile" className="gap-2">
          <User size={16} />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell size={16} />
          Notificações
        </TabsTrigger>
        <TabsTrigger value="appearance" className="gap-2">
          <Palette size={16} />
          Aparência
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4 mt-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={profile.phone || ''}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuso horário</Label>
              <Select
                value={profile.timezone}
                onValueChange={v => setProfile(p => ({ ...p, timezone: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select
                value={profile.language}
                onValueChange={v => setProfile(p => ({ ...p, language: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => onSaveProfile?.(profile)} className="w-full">
            <Save size={16} className="mr-2" />
            Salvar Perfil
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4 mt-4">
        <Card className="p-4 space-y-4">
          <SettingsToggle
            label="Notificações por email"
            description="Receba atualizações importantes por email"
            checked={notifications.emailNotifications}
            onChange={v => setNotifications(n => ({ ...n, emailNotifications: v }))}
          />
          <SettingsToggle
            label="Notificações push"
            description="Receba alertas em tempo real"
            checked={notifications.pushNotifications}
            onChange={v => setNotifications(n => ({ ...n, pushNotifications: v }))}
          />
          <SettingsToggle
            label="Alertas de negócios"
            description="Atualizações sobre seus deals"
            checked={notifications.dealAlerts}
            onChange={v => setNotifications(n => ({ ...n, dealAlerts: v }))}
          />
          <SettingsToggle
            label="Lembretes de tarefas"
            description="Avisos sobre tarefas pendentes"
            checked={notifications.taskReminders}
            onChange={v => setNotifications(n => ({ ...n, taskReminders: v }))}
          />
          <SettingsToggle
            label="Atualizações de metas"
            description="Progresso das suas metas"
            checked={notifications.goalUpdates}
            onChange={v => setNotifications(n => ({ ...n, goalUpdates: v }))}
          />
          <SettingsToggle
            label="Atividade do time"
            description="Ações dos membros do seu time"
            checked={notifications.teamActivity}
            onChange={v => setNotifications(n => ({ ...n, teamActivity: v }))}
          />
          <Button onClick={() => onSaveNotifications?.(notifications)} className="w-full">
            <Save size={16} className="mr-2" />
            Salvar Preferências
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4 mt-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select
              value={appearance.theme}
              onValueChange={v => setAppearance(a => ({ ...a, theme: v as 'light' | 'dark' | 'system' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SettingsToggle
            label="Modo compacto"
            description="Reduza o espaçamento da interface"
            checked={appearance.compactMode}
            onChange={v => setAppearance(a => ({ ...a, compactMode: v }))}
          />
          <SettingsToggle
            label="Animações"
            description="Habilite animações e transições"
            checked={appearance.animationsEnabled}
            onChange={v => setAppearance(a => ({ ...a, animationsEnabled: v }))}
          />
          <Button onClick={() => onSaveAppearance?.(appearance)} className="w-full">
            <Save size={16} className="mr-2" />
            Salvar Aparência
          </Button>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingsToggle: FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-sm">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
