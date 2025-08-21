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
  teamName?: string; // e.g. "CDI", "CDD", ...
  // ... autres champs éventuels
};

interface Props {
  agents: Agent[] | undefined | null;
  height?: number;
}

// Couleurs pour les équipes : 20 couleurs différentes
const TEAMS_COLORS = [
  '#3B82F6', // Bleu
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange foncé
  '#EC4899', // Rose
  '#6B7280', // Gris
  '#D97706', // Jaune
  '#F43F5E', // Rose clair
  '#A78BFA', // Violet clair
  '#FDE047', // Jaune clair 
  '#F87171', // Rouge clair
  '#34D399', // Vert clair  
  '#60A5FA', // Bleu clair
  '#FCD34D', // Jaune vif 
  '#F87171', // Rouge vif
  '#A3E635', // Vert vif
];

export default function AgentsTeamsPieChart({ agents, height = 360 }: Props) {
  const data = useMemo(() => {
    if (!Array.isArray(agents) || agents.length === 0) return [];
    //console.log("AgentsTeamsPieChart data", agents);

    const counts = agents.reduce<Record<string, number>>((acc, a) => {
      const key = a.teamName ?? "Sans équipe";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [agents]);

  if (!data.length) return null;
  //console.log("AgentsTeamsPieChart processed data", data);
  const teamColorMap: Map<string, string> = new Map();
  data.forEach((team, index) => {
    teamColorMap.set(team.name, TEAMS_COLORS[index % 20]);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Répartition par équipes</h3>
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
                  fill={teamColorMap.get(entry.name) ?? "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: string, props) => {
                return [`${props.payload.name} = ${value}`]; // Affiche "Équipe 1 = 21"
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