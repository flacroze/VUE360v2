import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter } from 'lucide-react';
import { FilterOptions } from "../shared/schema";

// Types pour les données
interface AgentSchedule {
  id: number;
  firstName: string;
  lastName: string;
  date: string;
  schedule: string;
}

interface AgentSchedulesGridProps {
  filters?: FilterOptions;
  className?: string;
  onDataChange?: (data: AgentSchedule[]) => void;
  height?: string;
}

// Composant principal
const AgentSchedulesGrid: React.FC<AgentSchedulesGridProps> = ({
  filters = {},
  className = "",
  height = 'h-[600px]',
}) => {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const response = await fetch(`/api/planning/schedule/repartition?${params.toString()}`);

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const responseData: AgentSchedule[] = await response.json();

        setSchedules(responseData);

      } catch (err: any) {
        setError(err.message);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Traitement des données pour créer la matrice
  const processData = () => {
    // Grouper par agent
    const agentMap = new Map<number, {
      id: number;
      firstName: string;
      lastName: string;
      schedules: Map<string, string>;
    }>();

    schedules.forEach(item => {
      if (!agentMap.has(item.id)) {
        agentMap.set(item.id, {
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          schedules: new Map()
        });
      }
      agentMap.get(item.id)!.schedules.set(item.date, item.schedule);
    });

    // Obtenir toutes les dates uniques et les trier
    const allDates = [...new Set(schedules.map(s => s.date))].sort();

    // Obtenir tous les horaires uniques et les trier
    const allSchedules = [...new Set(schedules.map(s => s.schedule))].sort();

    return {
      agents: Array.from(agentMap.values()),
      dates: allDates,
      schedules: allSchedules
    };
  };

  // Fonction pour obtenir la couleur d'un horaire
  const getScheduleColor = (schedule: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800',
    ];
    
    // Générer un index basé sur la chaîne de caractères
    const hash = schedule.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des horaires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-red-500">
          <p className="mb-2">❌ Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { agents, dates, schedules: uniqueSchedules } = processData();

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Horaires des Agents</h2>
        </div>
        <p className="text-sm text-gray-600">
          Vue matricielle des horaires par agent et par type d'horaire
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">{agents.length}</span>
          </div>
          <p className="text-sm text-gray-600">Agents</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">{dates.length}</span>
          </div>
          <p className="text-sm text-gray-600">Jours</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-lg font-bold text-purple-600">{uniqueSchedules.length}</span>
          </div>
          <p className="text-sm text-gray-600">Horaires différents</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2">
            <Filter className="h-4 w-4 text-orange-600" />
            <span className="text-lg font-bold text-orange-600">{schedules.length}</span>
          </div>
          <p className="text-sm text-gray-600">Total entrées</p>
        </div>
      </div>

      {/* Légende des horaires */}
      {/* <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Légende des horaires :</h3>
        <div className="flex flex-wrap gap-2">
          {uniqueSchedules.map((schedule, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded-md ${getScheduleColor(schedule)}`}
            >
              {schedule}
            </span>
          ))}
        </div>
      </div> */}

      {/* Tableau principal */}
      <div className={`overflow-auto border border-gray-200 rounded-lg ${height}`}>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Agent
              </th>
              {uniqueSchedules.map((schedule, index) => (
                <th
                  key={index}
                  className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                  title={schedule}
                >
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">
                      {schedule.split(' - ')[0]}
                    </div>
                    <div className="font-semibold">
                      {schedule.split(' - ')[1]}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent, agentIndex) => (
              <tr
                key={agent.id}
                className={agentIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="sticky left-0 bg-inherit px-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">
                      {agent.firstName} {agent.lastName}
                    </div>
                    {/* <div className="text-xs text-gray-500">ID: {agent.id}</div> */}
                  </div>
                </td>
                {uniqueSchedules.map((schedule, scheduleIndex) => {
                  const hasSchedule = Array.from(agent.schedules.values()).includes(schedule);
                  const datesWithThisSchedule = Array.from(agent.schedules.entries())
                    .filter(([_, s]) => s === schedule)
                    .map(([date, _]) => date);
                  
                  return (
                    <td
                      key={scheduleIndex}
                      className="text-center text-sm"
                    >
                      {hasSchedule ? (
                        <div
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getScheduleColor(schedule)} font-bold cursor-help`}
                          title={`Dates: ${datesWithThisSchedule.join(', ')}`}
                        >
                          {datesWithThisSchedule.length}
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note explicative */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Lecture du tableau :</strong> Chaque cellule indique le nombre de jours où l'agent a travaillé avec l'horaire correspondant.
          Survolez les badges colorés pour voir les dates spécifiques.
        </p>
      </div>
    </div>
  );
};

export default AgentSchedulesGrid;