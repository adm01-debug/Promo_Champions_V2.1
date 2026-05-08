import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { categoryHsl, categoryLabel, type QuestionAnalysis, type QuestionCategory } from "./questionHelpers";

interface Props {
  analysis: QuestionAnalysis;
}

const ORDER: QuestionCategory[] = ["open", "discovery", "impact", "closed", "leading", "other"];

export const QuestionMixDonut = ({ analysis }: Props) => {
  const data = ORDER.map((c) => ({
    name: categoryLabel(c),
    key: c,
    value:
      c === "open"
        ? analysis.open_questions
        : c === "discovery"
        ? analysis.discovery_questions
        : c === "impact"
        ? analysis.impact_questions
        : c === "closed"
        ? analysis.closed_questions
        : c === "leading"
        ? analysis.leading_questions
        : Math.max(
            0,
            analysis.total_questions -
              (analysis.open_questions +
                analysis.discovery_questions +
                analysis.impact_questions +
                analysis.closed_questions +
                analysis.leading_questions)
          ),
  })).filter((d) => d.value > 0);

  if (data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">Sem perguntas detectadas.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.key} fill={categoryHsl(d.key as QuestionCategory)} />
          ))}
        </Pie>
        <Tooltip
          content={(props: any) => {
            const { active, payload } = props as { active?: boolean; payload?: Array<{ name: string; value: number }> };
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow">
                <span className="font-medium">{p.name}</span>: {p.value}
              </div>
            );
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
