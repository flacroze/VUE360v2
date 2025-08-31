import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FilterOptions } from "../shared/schema";

// Types pour les données
interface AgentOccupancy {
  agentId: number;
  lastName: string;
  firstName: string;
  planned: number;
  assigned: number;
  occupancy: number; // Calculé en %
}
interface AgentOccupancyChartProps {
  filters: FilterOptions;
  onDataChange?: (data: AgentOccupancy[]) => void;
  className?: string;
  height?: string; // Optionnel pour la hauteur du graphique
}

export default function AgentOccupancyChart ({ filters , onDataChange, className, height } : AgentOccupancyChartProps) {
  const [data, setData] = useState<AgentOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour calculer le taux d'occupation
  const calculateOccupancy = (planned: number, assigned: number): number => {
    return planned > 0 ? Math.round((assigned / planned) * 100 * 10) / 10 : 0;
  };

  // Fonction pour récupérer les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`/api/planning/agent/occupancy?${params.toString()}`);

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const responseData: AgentOccupancy[] = await response.json();

        const processedData = responseData.map(agent => ({
          ...agent,
          occupancy: calculateOccupancy(agent.planned, agent.assigned),
          planned: Math.round(agent.planned * 10) / 10.0,
          assigned: Math.round(agent.assigned * 10) / 10.0,
          displayName: `${agent.firstName} ${agent.lastName}`
        }));

        const sortedAgents = processedData.sort((a, b) => a.occupancy - b.occupancy);

        setData(sortedAgents);
        onDataChange?.(sortedAgents);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, onDataChange]);

   // Fonction pour obtenir la couleur en fonction du taux d'occupation
  const getBarColor = (occupancy: number): string => {
    if (occupancy >= 80) return '#ef4444'; // Rouge - surcharge
    if (occupancy >= 70) return '#f97316'; // Orange - proche de la limite
    if (occupancy >= 50) return '#22c55e'; // Vert - bon taux
    if (occupancy >= 20) return '#3b82f6'; // Bleu - sous-utilisé
    return '#6b7280'; // Gris - très faible activité
  };

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`${data.firstName} ${data.lastName}`}</p>
          {/* <p className="text-sm text-gray-600">{`Agent ID: ${data.agentId}`}</p> */}
          <p className="text-sm">{`Heures disponibles: ${data.planned}h`}</p>
          <p className="text-sm">{`Heures activités: ${data.assigned}h`}</p>
          <p className="text-sm font-semibold">{`Taux d'activité: ${data.occupancy}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className} `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className} `}>
        <div className="text-center text-red-500">
          <p className="mb-2">❌ Erreur de chargement</p>
          <p className="text-sm">{error}</p>
          <button 
            //onClick={fetchData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Taux d'activité des agents</h2>
        <p className="text-sm text-gray-600">
          Ratio heures d'activités / heures disponibles par agent
        </p>
        
        {/* Légende des couleurs */}
        <div className="flex flex-wrap gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>≥ 80% (Très élevé)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>70-79% (Élevé)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>50-69% (Moyen)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>20-49% (Faible)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>&lt; 20% (Très faible)</span>
          </div>
        </div>
      </div>
      
      <div className=" h-96" style={{ height: height || '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 100,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayName"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={10}
            />
            <YAxis 
              label={{ value: 'Taux d\'occupation (%)', angle: -90, position: 'insideLeft' }}
              //domain={[0, maxOccupancy]}
              type="number"  //Laisser Recharts ajuster automatiquement           
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="occupancy" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.occupancy)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistiques résumées */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-semibold">Agents total</p>
          <p className="text-lg text-blue-600">{data.length}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-semibold">Taux moyen</p>
          <p className="text-lg text-green-600">
            {data.length > 0 ? Math.round(data.reduce((sum, agent) => sum + agent.occupancy, 0) / data.length) : 0}%
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-semibold">Surcharge (≥80%)</p>
          <p className="text-lg text-red-600">
            {data.filter(agent => agent.occupancy >= 80).length}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-semibold">Sous-utilisé (&lt;50%)</p>
          <p className="text-lg text-orange-600">
            {data.filter(agent => agent.occupancy < 50).length}
          </p>
        </div>
      </div>
    </div>
  );
};
