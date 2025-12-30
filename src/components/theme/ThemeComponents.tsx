import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  Sliders,
  Type,
  Layout,
  Eye
} from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ThemeSelectorProps {
  themes: ThemeOption[];
  currentTheme: string;
  onSelectTheme?: (themeId: string) => void;
}

export const ThemeSelector: FC<ThemeSelectorProps> = ({
  themes,
  currentTheme,
  onSelectTheme
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Temas</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`p-4 border rounded-lg text-center transition-colors ${
              currentTheme === theme.id 
                ? 'border-primary ring-2 ring-primary ring-offset-2' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectTheme?.(theme.id)}
          >
            <div className="flex justify-center gap-1 mb-2">
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: theme.preview.primary }}
              />
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: theme.preview.secondary }}
              />
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: theme.preview.accent }}
              />
            </div>
            <p className="text-sm font-medium">{theme.name}</p>
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-primary mx-auto mt-1" />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};

interface AppearanceSettingsProps {
  settings: {
    colorMode: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
    highContrast: boolean;
  };
  onUpdate?: (key: string, value: unknown) => void;
}

export const AppearanceSettings: FC<AppearanceSettingsProps> = ({
  settings,
  onUpdate
}) => {
  const colorModes = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Escuro' },
    { id: 'system', icon: Monitor, label: 'Sistema' }
  ];

  const fontSizes = [
    { id: 'small', label: 'Pequeno' },
    { id: 'medium', label: 'Médio' },
    { id: 'large', label: 'Grande' }
  ];

  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Sliders className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Aparência</h4>
      </div>

      {/* Color Mode */}
      <div>
        <label className="text-sm font-medium mb-3 block">Modo de Cor</label>
        <div className="flex gap-2">
          {colorModes.map((mode) => (
            <Button
              key={mode.id}
              variant={settings.colorMode === mode.id ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onUpdate?.('colorMode', mode.id)}
            >
              <mode.icon className="h-4 w-4 mr-2" />
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Type className="h-4 w-4" />
          Tamanho da Fonte
        </label>
        <div className="flex gap-2">
          {fontSizes.map((size) => (
            <Button
              key={size.id}
              variant={settings.fontSize === size.id ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onUpdate?.('fontSize', size.id)}
            >
              {size.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Modo Compacto</p>
              <p className="text-sm text-muted-foreground">Reduz espaçamento entre elementos</p>
            </div>
          </div>
          <Switch 
            checked={settings.compactMode}
            onCheckedChange={(v) => onUpdate?.('compactMode', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Animações</p>
              <p className="text-sm text-muted-foreground">Ativar transições e animações</p>
            </div>
          </div>
          <Switch 
            checked={settings.animations}
            onCheckedChange={(v) => onUpdate?.('animations', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Alto Contraste</p>
              <p className="text-sm text-muted-foreground">Melhora legibilidade</p>
            </div>
          </div>
          <Switch 
            checked={settings.highContrast}
            onCheckedChange={(v) => onUpdate?.('highContrast', v)}
          />
        </div>
      </div>
    </Card>
  );
};

interface ColorPickerProps {
  label: string;
  value: string;
  onChange?: (color: string) => void;
  presets?: string[];
}

export const ColorPicker: FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presets = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <div className="flex gap-1">
          {presets.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                value === color ? 'border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange?.(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
