import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  type CallObjection,
  type ObjectionType,
  objectionTypeHsl,
  objectionTypeLabel,
} from "./objectionHelpers";

interface Props {
  objections: CallObjection[];
}

const TYPES: ObjectionType[] = ["price", "timing", "authority", "need", "competition", "trust", "other"];

export function ObjectionTypeDonut({ objections }: Props) {
  const counts = TYPES.map((t) => ({
    type: t,
    name: objectionTypeLabel(t),
    value: objections.filter((o) => o.objection_type === t).length,
    fill: objectionTypeHsl(t),
  })).filter((c) => c.value > 0);

  if (!counts.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sem objeções para distribuir
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={counts}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
          >
            {counts.map((c) => (
              <Cell key={c.type} fill={c.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
            formatter={(v) => <span className="text-muted-foreground">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
