import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { DailyHoursResponse } from "./shared/schema"

type DailyHoursProps = {
  filters: any; // ou le type spécifique de tes filtres
  onDataChange?: (data: DailyHoursResponse) => void;
};

const DailyHours: React.FC<DailyHoursProps> = ({ filters }) => {
  // États
  const [data, setData] = useState<DailyHoursResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Construire les query params à partir des filtres
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`/api/planning/daily-breakdown?${params.toString()}`);

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data: DailyHoursResponse = await response.json();
        setData(data);
        //onDataChange?.(data); // remonter les données au parent
      } catch (err: any) {
        setError(err.message);
        setData(null);
        //onDataChange?.([]); // informer le parent en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <div className="w-full space-y-6">        
        
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Heures planifiées et affectées par jour
          </h1>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">Erreur:</span>
              <span className="text-red-700 ml-1">{error}</span>
            </div>
          </div>
        )}

        {/* Tableau des données */}
        {!loading && !error && (
          <DailyHoursTable data={data || undefined} />
        )}

      </div>
    
    </div>
  );
};

export default DailyHours;


////////////////////////////////////////////////////////////////////////
//  Table pour afficher les heures planifiées et affectées par jour
////////////////////////////////////////////////////////////////////////

const DailyHoursTable: React.FC<{ data?: DailyHoursResponse }> = ({ data }) => {
  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Aucune donnée disponible pour la période sélectionnée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Détail quotidien - Heures planifiées et affectées
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Jour</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Heures planifiées</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Heures affectées</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Taux d'affectation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.data.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{day.dayOfWeek}</td>
                <td className="px-6 py-4 text-sm font-medium text-blue-600 text-right">
                  {day.plannedHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600 text-right">
                  {day.assignedHours.toFixed(1)}h
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${
                  day.utilizationRate >= 60 ? 'text-green-600' : 
                  day.utilizationRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {day.utilizationRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div></div>
          <div></div>
          <div className="text-right">
            <span className="text-gray-600">Total planifié: </span>
            <span className="font-semibold text-blue-600">
              {data.totalPlannedHours.toFixed(1)}h
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Total affecté: </span>
            <span className="font-semibold text-green-600">
              {data.totalAssignedHours.toFixed(1)}h
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Taux moyen: </span>
            <span className={`font-semibold ${
              data.averageUtilizationRate >= 60 ? 'text-green-600' : 
              data.averageUtilizationRate >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {data.averageUtilizationRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};