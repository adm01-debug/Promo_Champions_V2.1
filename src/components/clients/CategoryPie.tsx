import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface CategoryPieDatum {
  name: string;
  value: number;
}

export interface CategoryPieProps {
  data: CategoryPieDatum[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'];

export function CategoryPie({ data }: CategoryPieProps) {
  return (
    <>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % 5]} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full mt-4">
        {data.map((cat, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5"
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % 5] }}
            />
            <span className="text-[8px] font-bold uppercase truncate opacity-80">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default CategoryPie;
