import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Flame, ThermometerSun, Snowflake } from 'lucide-react';
import type { ColdLead } from './types';

interface FollowUpStatsGridProps {
  leads: ColdLead[];
  onFilterChange: (filter: string) => void;
}

const statConfig = [
  { key: 'total', label: 'Total em Risco', icon: AlertTriangle, colorClass: 'text-foreground' },
  { key: 'hot', label: 'Quentes', icon: Flame, colorClass: 'text-destructive' },
  { key: 'warm', label: 'Mornos', icon: ThermometerSun, colorClass: 'text-status-warning' },
  { key: 'cold', label: 'Frios', icon: Snowflake, colorClass: 'text-status-info' },
  { key: 'frozen', label: 'Congelados', icon: Snowflake, colorClass: 'text-primary' },
] as const;

export function FollowUpStatsGrid({ leads, onFilterChange }: FollowUpStatsGridProps) {
  const counts: Record<string, number> = {
    total: leads.length,
    hot: leads.filter(l => l.temperature === 'hot').length,
    warm: leads.filter(l => l.temperature === 'warm').length,
    cold: leads.filter(l => l.temperature === 'cold').length,
    frozen: leads.filter(l => l.temperature === 'frozen').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statConfig.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
            onClick={() => onFilterChange(stat.key === 'total' ? 'all' : stat.key)}
          >
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.colorClass} group-hover:scale-110 transition-transform`} />
              <div className="text-metric">{counts[stat.key]}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
