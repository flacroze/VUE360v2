import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type Agent = {
  id: number;
  contractType?: string; // e.g. "CDI", "CDD", ...
  // ... autres champs éventuels
};

interface Props {
  agents: Agent[] | undefined | null;
  height?: number;
}

const COLORS: Record<string, string> = {
  CDI: "#4CAF50",
  CDD: "#4B8AF6",
  "Intérim": "#F6C24A",
  "Alternance": "#9C6CFA",
  "Stage": "#F26A5A",
  "Autre": "#757575",
};


export default function AgentsContractsPieChart({ agents, height = 360 }: Props) {
  const data = useMemo(() => {
    if (!Array.isArray(agents) || agents.length === 0) return [];

    const counts = agents.reduce<Record<string, number>>((acc, a) => {
      const key = a.contractType ?? "Autre";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [agents]);

  if (!data.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Répartition par contrats</h3>
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={3}
              label={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] ?? "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: string, props) => {
                return [`${props.payload.name} = ${value}`]; // Affiche "CDI = 31"
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => {
                const item = data.find(d => d.name === value);
                return `${String(value)} (${item ? item.value : 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}