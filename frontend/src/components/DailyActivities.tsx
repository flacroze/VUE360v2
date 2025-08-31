import React, { useState, useEffect } from 'react';
import { AlertCircle, BarChart3 } from 'lucide-react';

// Types pour les données (basé sur ta structure API)
type ActivityData = {
  id: number;
  name: string;
  date: string; // Format "DD-MM-YYYY"
  duration: string; // Format "HH:MM:SS"
};

type DailyActivityProps = {
  filters: any;
  onDataChange?: (data: ActivityData[]) => void;
};

// Fonction pour convertir la durée en minutes
function durationToMinutes(duration: string): number {
  const [hours, minutes, seconds] = duration.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60;
}

  // Fonction pour formater les minutes en heures
  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }

// Couleurs pour les activités
const ACTIVITY_COLORS = [
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
];

const DailyActivities: React.FC<DailyActivityProps> = ({ filters, onDataChange }) => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

// Extraire les activités uniques et associer les couleurs
const activities = [...new Set(data.map(item => item.name))];
const activityColorMap: Map<string, string> = new Map();
activities.forEach((activity, index) => {
  activityColorMap.set(activity, ACTIVITY_COLORS[index % 10]);
});
  
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

        const response = await fetch(`/api/planning/activity/repartition?${params.toString()}`);
        //const response = await fetch(`/api/planning/activity/repartition`);

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const responseData: ActivityData[] = await response.json();
        setData(responseData);
        onDataChange?.(responseData);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, onDataChange]);

  // Traitement des données pour l'histogramme
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Grouper par date
    const groupedByDate = data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push({
        ...item,
        durationMinutes: durationToMinutes(item.duration)
      });
      return acc;
    }, {} as Record<string, Array<ActivityData & { durationMinutes: number }>>);

    // Calculer les pourcentages pour chaque jour
    return Object.entries(groupedByDate).map(([date, activities]) => {
      const totalMinutes = activities.reduce((sum, activity) => sum + activity.durationMinutes, 0);
      
      const activitiesWithPercentage = activities.map((activity, index) => ({
        ...activity,
        percentage: totalMinutes > 0 ? (activity.durationMinutes / totalMinutes) * 100 : 0,
        color: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]
      }));
      
      // Convertir la date DD-MM-YYYY vers un objet Date pour le tri et l'affichage
      const [day, month, year] = date.split('-');
      const dateObj = new Date(`${year}-${month}-${day}`);

      return {
        date,
        dateObj,
        activities: activitiesWithPercentage,
        totalMinutes,
        dayOfWeek: dateObj.toLocaleDateString('fr-FR', { weekday: 'long' })
      };
    }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-500">
            Répartition des activités par jour
          </h2>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Erreur: {error}</span>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="p-5 max-w-2xl">        
        <div className="flex flex-row gap-5 flex-wrap">
          {activities.map((activity) => (
            <div key={activity} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                style={{ backgroundColor: activityColorMap.get(activity) }}
              ></div>
              <span className="text-base">{activity}</span>
            </div>
          ))}
        </div>
      </div>   

      {/* Histogrammes */}
      <div className="p-0 space-y-1">
        {processedData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Aucune donnée disponible pour la période sélectionnée</p>
          </div>
        ) : (
          processedData.map((dayData) => (
            <div key={dayData.date} className="border border-gray-200 rounded-lg p-1">
              {/* En-tête du jour */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {dayData.dayOfWeek}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dayData.dateObj.toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Total: {formatMinutes(dayData.totalMinutes)}
                  </p>
                </div>
              </div>

              {/* Barre d'histogramme */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                <div className="flex h-full">
                  {dayData.activities.map((activity, index) => (
                    <div
                      key={`${activity.id}-${index}`}
                      className="flex items-center justify-center text-white text-xs font-medium transition-all duration-200 hover:opacity-80"
                      style={{
                        width: `${activity.percentage}%`,
                        backgroundColor: activity.color,
                        minWidth: activity.percentage > 5 ? 'auto' : '0px'
                      }}
                      title={`${activity.name}: ${formatMinutes(activity.durationMinutes)} (${activity.percentage.toFixed(1)}%)`}
                    >
                      {activity.percentage > 8 && (
                        <span className="truncate px-1">
                          {activity.percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Légende */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {dayData.activities.map((activity, index) => (
                  <div key={`legend-${activity.id}-${index}`} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    ></div>
                    <span className="text-sm text-gray-700 truncate">
                      {activity.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 ml-auto">
                      {formatMinutes(activity.durationMinutes)} ({activity.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div> */}
            </div>
          ))
        )}
      </div>

      {/* Résumé global */}
      {/* {data && processedData.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-center">
            <span className="text-gray-600">Nombre de jours: </span>
            <span className="font-semibold text-gray-900">
              {processedData.length}
            </span>
            <span className="text-gray-600 ml-4">Total d'activités: </span>
            <span className="font-semibold text-gray-900">
              {data.length}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default DailyActivities;