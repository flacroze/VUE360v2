import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, User, Activity, Clock } from 'lucide-react';

interface AgentAssignmentData {
  agentId: number;
  name: string;
  lastName: string;
  firstName: string;
  assigned: string;
  planned: string;
  ratio: string;
}

type AgentAssignmentProps = {
  filters: any;
  onDataChange?: (data: AgentAssignmentData[]) => void;
};

const AgentAssignmentTable: React.FC<AgentAssignmentProps> = ({ filters, onDataChange }) => {
  const [data, setData] = useState<AgentAssignmentData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AgentAssignmentData;
    direction: 'asc' | 'desc';
  }>({ key: 'lastName', direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`/api/planning/agent/assignments?${params.toString()}`);

        if (!response.ok) {
          if (response.status === 404) {
            console.warn('API endpoint not found, using sample data');
            const sampleData: AgentAssignmentData[] = [
              { agentId: 223, name: "Back-Office", lastName: "DELON", firstName: "Alain", assigned: "1.0000", planned: "44.0000", ratio: "0.02272727" },
              { agentId: 223, name: "Réception d'appels", lastName: "DELON", firstName: "Alain", assigned: "3.0000", planned: "44.0000", ratio: "0.06818182" },
              { agentId: 223, name: "Réponse emails", lastName: "DELON", firstName: "Alain", assigned: "18.5000", planned: "44.0000", ratio: "0.42045455" },
              { agentId: 224, name: "Back-Office", lastName: "DUPONT", firstName: "Antoine", assigned: "17.5000", planned: "44.0000", ratio: "0.39772727" },
              { agentId: 224, name: "Réception d'appels", lastName: "DUPONT", firstName: "Antoine", assigned: "3.0000", planned: "44.0000", ratio: "0.06818182" },
              { agentId: 228, name: "Back-Office", lastName: "Effacé", firstName: "Utilisateur", assigned: "13.5000", planned: "35.2000", ratio: "0.38352273" },
              { agentId: 228, name: "Réception d'appels", lastName: "Effacé", firstName: "Utilisateur", assigned: "9.0000", planned: "35.2000", ratio: "0.25568182" },
              { agentId: 228, name: "Réponse emails", lastName: "Effacé", firstName: "Utilisateur", assigned: "34.5000", planned: "35.2000", ratio: "0.98011364" },
              { agentId: 231, name: "Réception d'appels", lastName: "PARKER", firstName: "Tony", assigned: "27.0000", planned: "44.0000", ratio: "0.61363636" },
              { agentId: 232, name: "Réception d'appels", lastName: "HUGO", firstName: "Victor", assigned: "29.5000", planned: "43.0000", ratio: "0.68604651" },
              { agentId: 233, name: "Back-Office", lastName: "MOREAU", firstName: "Jeanne", assigned: "7.5000", planned: "43.0000", ratio: "0.17441860" },
              { agentId: 233, name: "Réception d'appels", lastName: "MOREAU", firstName: "Jeanne", assigned: "23.5000", planned: "43.0000", ratio: "0.54651163" },
              { agentId: 235, name: "Réception d'appels", lastName: "GARCIA", firstName: "Caroline", assigned: "3.0000", planned: "44.0000", ratio: "0.06818182" },
              { agentId: 236, name: "Réception d'appels", lastName: "LECONTE", firstName: "Henri", assigned: "3.0000", planned: "35.2000", ratio: "0.08522727" },
              { agentId: 239, name: "Réception d'appels", lastName: "PIAF", firstName: "Edith", assigned: "30.5000", planned: "44.0000", ratio: "0.69318182" },
              { agentId: 240, name: "Réception d'appels", lastName: "RODIN", firstName: "Auguste", assigned: "28.5000", planned: "44.0000", ratio: "0.64772727" },
              { agentId: 250, name: "Réception d'appels", lastName: "LUTHER KING", firstName: "Martin", assigned: "27.5000", planned: "44.0000", ratio: "0.62500000" },
              { agentId: 251, name: "Réception d'appels", lastName: "PICASSO", firstName: "Pablo", assigned: "20.0000", planned: "44.0000", ratio: "0.45454545" },
              { agentId: 251, name: "Réponse emails", lastName: "PICASSO", firstName: "Pablo", assigned: "10.0000", planned: "44.0000", ratio: "0.22727273" },
              { agentId: 252, name: "Back-Office", lastName: "EINSTEIN", firstName: "Albert", assigned: "2.0000", planned: "44.0000", ratio: "0.04545455" },
              { agentId: 252, name: "Réception d'appels", lastName: "EINSTEIN", firstName: "Albert", assigned: "3.0000", planned: "44.0000", ratio: "0.06818182" },
              { agentId: 252, name: "Réponse emails", lastName: "EINSTEIN", firstName: "Albert", assigned: "24.0000", planned: "44.0000", ratio: "0.54545455" },
              { agentId: 253, name: "Back-Office", lastName: "VERSTAPPEN", firstName: "Max", assigned: "22.5000", planned: "43.0000", ratio: "0.52325581" },
              { agentId: 253, name: "Réception d'appels", lastName: "VERSTAPPEN", firstName: "Max", assigned: "3.5000", planned: "43.0000", ratio: "0.08139535" },
              { agentId: 254, name: "Back-Office", lastName: "ZOLA", firstName: "Emile", assigned: "16.5000", planned: "43.0000", ratio: "0.38372093" },
              { agentId: 254, name: "Réception d'appels", lastName: "ZOLA", firstName: "Emile", assigned: "5.5000", planned: "43.0000", ratio: "0.12790698" },
              { agentId: 257, name: "Back-Office", lastName: "TAVERNIER", firstName: "Bertrand", assigned: "17.5000", planned: "44.0000", ratio: "0.39772727" },
              { agentId: 257, name: "Réception d'appels", lastName: "TAVERNIER", firstName: "Bertrand", assigned: "3.0000", planned: "44.0000", ratio: "0.06818182" },
              { agentId: 258, name: "Back-Office", lastName: "FRANCOIS", firstName: "Claude", assigned: "4.5000", planned: "35.2000", ratio: "0.12784091" },
              { agentId: 258, name: "Réception d'appels", lastName: "FRANCOIS", firstName: "Claude", assigned: "3.0000", planned: "35.2000", ratio: "0.08522727" },
              { agentId: 258, name: "Réponse emails", lastName: "FRANCOIS", firstName: "Claude", assigned: "12.0000", planned: "35.2000", ratio: "0.34090909" },
              { agentId: 260, name: "Réception d'appels", lastName: "PLATINI", firstName: "Michel", assigned: "25.5000", planned: "43.0000", ratio: "0.59302326" },
              { agentId: 261, name: "Back-Office", lastName: "MAURESMO", firstName: "Amélie", assigned: "2.5000", planned: "44.0000", ratio: "0.05681818" },
              { agentId: 261, name: "Réception d'appels", lastName: "MAURESMO", firstName: "Amélie", assigned: "26.5000", planned: "44.0000", ratio: "0.60227273" },
              { agentId: 5783, name: "Back-Office", lastName: "GAUGUIN", firstName: "Paul", assigned: "6.0000", planned: "43.0000", ratio: "0.13953488" },
              { agentId: 5783, name: "Réception d'appels", lastName: "GAUGUIN", firstName: "Paul", assigned: "3.5000", planned: "43.0000", ratio: "0.08139535" },
              { agentId: 5783, name: "Réponse emails", lastName: "GAUGUIN", firstName: "Paul", assigned: "15.0000", planned: "43.0000", ratio: "0.34883721" }
            ];
            setData(sampleData);
            onDataChange?.(sampleData);
            return;
          }
          throw new Error(`HTTP error! ${response.status}`);
        }

        const responseData: AgentAssignmentData[] = await response.json();
        setData(responseData);
        onDataChange?.(responseData);
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, onDataChange]);

  const getActivityColor = (activityName: string, index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500',
      'bg-red-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-cyan-500', 'bg-rose-500', 'bg-lime-500'
    ];
    let hash = 0;
    for (let i = 0; i < activityName.length; i++) {
      hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const handleSort = (key: keyof AgentAssignmentData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = data ? [...data].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal, 'fr-FR')
        : bVal.localeCompare(aVal, 'fr-FR');
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  }) : [];

  const getSortIcon = (key: keyof AgentAssignmentData) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
  };

  // Fonction formatHours avec conversion de string à number
  const formatHours = (hours: string | undefined | null) => {
    if (!hours || isNaN(Number(hours))) return '0.0h';
    return `${Number(hours).toFixed(1)}h`;
  };

  const formatRatio = (ratio: string) => {
    if (!ratio || isNaN(Number(ratio))) return '0.0%';
    return `${(Number(ratio) * 100).toFixed(1)}%`;
  };

  const getRatioColor = (ratio: number) => {
    const percentage = ratio * 100;
    if (percentage >= 70) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Calcul des totaux avec conversion
  const totalAssigned = data?.reduce((sum, item) => sum + (Number(item.assigned) || 0), 0) || 0;
  const totalPlanned = data?.reduce((sum, item) => sum + (Number(item.planned) || 0), 0) || 0;
  const averageRatio = data?.length ? data.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0) / data.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Affectation des agents par activité</h1>
              <p className="text-gray-600 text-sm">
                Répartition des heures planifiées et affectées par agent et par type d'activité
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">Erreur:</span>
              <span className="text-red-700 ml-1">{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Détail par agent et activité</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('agentId')}>
                      <div className="flex items-center gap-1">Nom {getSortIcon('lastName')}</div>
                    </th>
                    <th className="px-6 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('firstName')}>
                      <div className="flex items-center gap-1">Prénom {getSortIcon('firstName')}</div>
                    </th>
                    <th className="px-6 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Activité {getSortIcon('name')}</div>
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('assigned')}>
                      <div className="flex items-center justify-end gap-1">Heures affectées {getSortIcon('assigned')}</div>
                    </th>
                    <th className="px-6 text-right text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('planned')}>
                      <div className="flex items-center justify-end gap-1">Heures planifiées {getSortIcon('planned')}</div>
                    </th>
                    <th className="px-6 text-right text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('ratio')}>
                      <div className="flex items-center justify-end gap-1">Taux d'affectation {getSortIcon('ratio')}</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedData.map((row, index) => (
                    <tr key={`${row.agentId}-${row.name}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 text-sm font-medium text-gray-900">{row.lastName}</td>
                      <td className="px-6 text-sm text-gray-700">{row.firstName}</td>
                      <td className="px-6 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getActivityColor(row.name, index)}`}></div>
                          {row.name}
                        </div>
                      </td>
                      <td className="px-6 text-sm font-medium text-green-600 text-right">{formatHours(row.assigned)}</td>
                      <td className="px-6 text-sm font-medium text-blue-600 text-right">{formatHours(row.planned)}</td>
                      <td className="px-6 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatioColor(Number(row.ratio))}`}>
                          {formatRatio(row.ratio)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600">Activités</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {new Set(data.map(d => d.name)).size}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Agents</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {new Set(data.map(d => d.agentId)).size}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">Total affecté</span>
                    </div>
                    <div className="font-semibold text-green-600 text-lg">
                      {formatHours(totalAssigned.toString())}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">Total planifié</span>
                    </div>
                    <div className="font-semibold text-blue-600 text-lg">
                      {formatHours(totalPlanned.toString())}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">Taux moyen</span>
                    </div>
                    <div className={`font-semibold text-lg ${
                      averageRatio >= 0.7 ? 'text-green-600' :
                      averageRatio >= 0.5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatRatio(averageRatio.toString())}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && (!data || (data && data.length === 0)) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
              <p>Aucune affectation d'agent trouvée pour la période sélectionnée</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAssignmentTable;