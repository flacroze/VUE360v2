import React from 'react';
import { Calendar } from 'lucide-react';

interface DayData {
  date: string;
  dayOfWeek: string;
  plannedHours: number;
  assignedHours: number;
  utilizationRate: number;
}

interface DailyHoursData {
  data: DayData[];
  totalPlannedHours: number;
  totalAssignedHours: number;
  averageUtilizationRate: number;
}

interface DailyHoursTableProps {
  data?: DailyHoursData;
}

const DailyHoursTable: React.FC<DailyHoursTableProps> = ({ data }) => {
  // Données d'exemple basées sur l'image fournie
  const defaultData: DailyHoursData = {
    data: [
      {
        date: "2025-06-30",
        dayOfWeek: "Lundi",
        plannedHours: 296.0,
        assignedHours: 165.0,
        utilizationRate: 56.0
      },
      {
        date: "2025-07-01",
        dayOfWeek: "Mardi",
        plannedHours: 297.0,
        assignedHours: 158.5,
        utilizationRate: 53.0
      },
      {
        date: "2025-07-02",
        dayOfWeek: "Mercredi",
        plannedHours: 270.5,
        assignedHours: 154.0,
        utilizationRate: 57.0
      },
      {
        date: "2025-07-03",
        dayOfWeek: "Jeudi",
        plannedHours: 278.4,
        assignedHours: 153.5,
        utilizationRate: 55.0
      }
    ],
    totalPlannedHours: 1141.9,
    totalAssignedHours: 631.0,
    averageUtilizationRate: 55.3
  };

  const tableData = data || defaultData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  const getRateColor = (rate: number) => {
    if (rate >= 60) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* En-tête */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Détail quotidien - Heures planifiées et affectées
          </h2>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                Jour
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-200">
                Heures planifiées
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-200">
                Heures affectées
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-200">
                Taux d'affectation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.data.map((day, index) => (
              <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(day.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {day.dayOfWeek}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-blue-600 text-right">
                  {formatHours(day.plannedHours)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600 text-right">
                  {formatHours(day.assignedHours)}
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${getRateColor(day.utilizationRate)}`}>
                  {formatRate(day.utilizationRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé (optionnel) */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <span className="text-gray-600">Total planifié: </span>
            <span className="font-semibold text-blue-600">
              {formatHours(tableData.totalPlannedHours)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-gray-600">Total affecté: </span>
            <span className="font-semibold text-green-600">
              {formatHours(tableData.totalAssignedHours)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-gray-600">Taux moyen: </span>
            <span className={`font-semibold ${getRateColor(tableData.averageUtilizationRate)}`}>
              {formatRate(tableData.averageUtilizationRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyHoursTable;