import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface VolumeControlProps {
  label?: string;
  volume: number;
  onVolumeChange: (v: number) => void;
}

export function VolumeControl({ label = "Volume", volume, onVolumeChange }: VolumeControlProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-4">
        <VolumeX className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          onValueChange={([value]) => onVolumeChange(value / 100)}
          max={100}
          step={5}
          className="flex-1"
        />
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
