import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { RechartsTooltipProps } from "@/types/recharts";

interface Props {
  seller: number;
  client: number;
  silence: number;
}

export function TalkRatioDonut({ seller, client, silence }: Props) {
  const data = [
    { name: "Vendedor", value: Math.round(seller * 100), color: "hsl(var(--primary))" },
    { name: "Cliente", value: Math.round(client * 100), color: "hsl(var(--info))" },
    { name: "Silêncio", value: Math.round(silence * 100), color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2}>
            {data.map((d) => <Cell key={d.name} fill={d.color} stroke="hsl(var(--background))" strokeWidth={2} />)}
          </Pie>
          <Tooltip
            content={({ active, payload }: RechartsTooltipProps) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div className="rounded-md border bg-popover px-2 py-1 text-xs">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-muted-foreground">{p.value}%</div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 flex justify-center gap-3 text-[11px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            {d.name} {d.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
