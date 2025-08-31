import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
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
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'both'>('both');
  
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
        
        {/* En-tête avec sélecteur de vue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Heures planifiées et affectées par jour
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Tableau
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Graphique
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'both' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Les deux
              </button>
            </div>
          </div>
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

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Graphique */}
            {(viewMode === 'chart' || viewMode === 'both') && (
              <DailyHoursChart data={data} />
            )}
            
            {/* Tableau */}
            {(viewMode === 'table' || viewMode === 'both') && (
              <DailyHoursTable data={data} />
            )}
          </div>
        )}

        {/* Message si pas de données */}
        {!loading && !error && (!data || data.data.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
              <p>Aucune donnée disponible pour la période sélectionnée</p>
            </div>
          </div>
        )}

      </div>
    
    </div>
  );
};

export default DailyHours;

////////////////////////////////////////////////////////////////////////
//  Graphique pour visualiser les heures planifiées et affectées
////////////////////////////////////////////////////////////////////////

const DailyHoursChart: React.FC<{ data: DailyHoursResponse }> = ({ data }) => {
  // Formatage des données pour le graphique
  const formattedData = data.data.map(day => ({
    ...day,
    shortDate: new Date(day.date).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    dayLabel: `${day.dayOfWeek.substring(0, 3)} ${new Date(day.date).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })}`
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${data.dayOfWeek} ${data.shortDate}`}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-300 rounded-full mr-2"></span>
              <span className="text-gray-600">Heures planifiées: </span>
              <span className="font-medium text-blue-600">{data.plannedHours.toFixed(1)}h</span>
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Heures affectées: </span>
              <span className="font-medium text-green-600">{data.assignedHours.toFixed(1)}h</span>
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Taux d'affectation: </span>
              <span className="font-medium text-orange-600">{data.utilizationRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* En-tête */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Évolution quotidienne - Heures et taux d'affectation
          </h2>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="hours"
                orientation="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Heures', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="rate"
                orientation="right"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: 'Taux (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              
              {/* Barres superposées - Planifiées en arrière-plan */}
              <Bar 
                yAxisId="hours"
                dataKey="plannedHours" 
                name="Heures planifiées"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
              {/* Affectées par-dessus les planifiées */}
              <Bar 
                yAxisId="hours"
                dataKey="assignedHours" 
                name="Heures affectées"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              />
              
              {/* Ligne pour le taux */}
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="utilizationRate"
                name="Taux d'affectation"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques résumées */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Total planifié</div>
            <div className="font-semibold text-blue-600 text-lg">
              {data.totalPlannedHours.toFixed(1)}h
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Total affecté</div>
            <div className="font-semibold text-green-600 text-lg">
              {data.totalAssignedHours.toFixed(1)}h
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Écart</div>
            <div className="font-semibold text-red-600 text-lg">
              -{(data.totalPlannedHours - data.totalAssignedHours).toFixed(1)}h
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Taux moyen</div>
            <div className={`font-semibold text-lg ${
              data.averageUtilizationRate >= 60 ? 'text-green-600' :
              data.averageUtilizationRate >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {data.averageUtilizationRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////////////////////////////
//  Table pour afficher les heures planifiées et affectées par jour
////////////////////////////////////////////////////////////////////////

const DailyHoursTable: React.FC<{ data: DailyHoursResponse }> = ({ data }) => {
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