import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export type RepartItem = { name: string; level: number; count: number };

interface Props {
  data: RepartItem[]; // raw backend data
  levels?: string[]; // optional labels (e.g. ['Aucun','En cours','Acquis','Expert'])
  height?: number;
}

const DEFAULT_LEVEL_LABELS = ["En cours", "Acquis", "Expert"];
const COLOR_MAP: Record<string, string> = {
  "En cours": "#F6C24A", // jaune
  Acquis: "#4B8AF6", // bleu
  Expert: "#7AD29E", // vert
};
const FALLBACK_COLOR = "#8884d8";

export default function SkillsRepartChart({ data, levels, height = 360 }: Props) {
  if (!data || !data.length) return null;

  // categories (activities)
  const categories = Array.from(new Set(data.map((d) => d.name)));

  // distinct numeric levels present (sorted)
  const levelNums = Array.from(new Set(data.map((d) => d.level))).sort((a, b) => a - b);

  // map numeric level -> label (try provided levels array first, fallback to default)
  const computedLabels = levelNums.map((n) => {
    if (levels && levels[n] !== undefined) return levels[n];
    return DEFAULT_LEVEL_LABELS[n] ?? String(n);
  });

  // filter out "Aucun" (both from labels and corresponding level numbers)
  const filtered = levelNums
    .map((ln, idx) => ({ ln, label: computedLabels[idx] }))
    .filter(({ label }) => label !== "Aucun");

  const filteredLevelNums = filtered.map((f) => f.ln);
  const filteredLabels = filtered.map((f) => f.label);

  // construct series: for chart we want an array of objects { name: category, [label1]: value, [label2]: value, ... }
  const chartData = categories.map((cat) => {
    const row: Record<string, number | string> = { name: cat };
    filteredLevelNums.forEach((ln, i) => {
      const label = filteredLabels[i];
      const item = data.find((d) => d.name === cat && d.level === ln);
      row[label] = item ? item.count : 0;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Répartition des compétences</h3>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
            {filteredLabels.map((label) => (
              <Bar
                key={label}
                dataKey={label}
                stackId="a"
                fill={COLOR_MAP[label] ?? FALLBACK_COLOR}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}